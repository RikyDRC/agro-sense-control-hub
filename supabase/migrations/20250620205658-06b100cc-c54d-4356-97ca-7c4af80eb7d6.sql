
-- Create notifications table for storing all notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success', 'maintenance'
  category TEXT NOT NULL DEFAULT 'general', -- 'alert', 'irrigation', 'device', 'system', 'broadcast'
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_push_sent BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}', -- Additional data like device_id, zone_id, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NULL -- For temporary notifications
);

-- Create user notification preferences table
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  device_alerts BOOLEAN NOT NULL DEFAULT true,
  irrigation_alerts BOOLEAN NOT NULL DEFAULT true,
  system_alerts BOOLEAN NOT NULL DEFAULT true,
  maintenance_alerts BOOLEAN NOT NULL DEFAULT true,
  broadcast_messages BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME NULL,
  quiet_hours_end TIME NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device tokens table for push notifications
CREATE TABLE public.user_device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ios', 'android', 'web'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Create broadcast messages table for admin messaging
CREATE TABLE public.broadcast_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'farmers', 'admins', 'specific'
  target_user_ids UUID[] NULL, -- For specific user targeting
  scheduled_at TIMESTAMP WITH TIME ZONE NULL,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
  recipients_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" 
  ON public.user_notification_preferences 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for device tokens
CREATE POLICY "Users can manage their own device tokens" 
  ON public.user_device_tokens 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for broadcast messages
CREATE POLICY "Admins can manage broadcast messages" 
  ON public.broadcast_messages 
  FOR ALL 
  USING (public.is_admin_or_super());

CREATE POLICY "Users can view sent broadcast messages" 
  ON public.broadcast_messages 
  FOR SELECT 
  USING (status = 'sent');

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_device_tokens_user_id ON public.user_device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON public.user_device_tokens(is_active);

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON public.notifications 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_notification_preferences_updated_at 
  BEFORE UPDATE ON public.user_notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_device_tokens_updated_at 
  BEFORE UPDATE ON public.user_device_tokens 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_broadcast_messages_updated_at 
  BEFORE UPDATE ON public.broadcast_messages 
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Function to create notification for user
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _category TEXT DEFAULT 'general',
  _data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, category, data
  ) VALUES (
    _user_id, _title, _message, _type, _category, _data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to create alert-based notifications
CREATE OR REPLACE FUNCTION public.create_alert_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification when new alert is inserted
  PERFORM public.create_notification(
    NEW.user_id,
    NEW.title,
    NEW.message,
    CASE NEW.severity
      WHEN 'critical' THEN 'error'
      WHEN 'high' THEN 'warning'
      WHEN 'medium' THEN 'warning'
      ELSE 'info'
    END,
    'alert',
    jsonb_build_object(
      'alert_id', NEW.id,
      'severity', NEW.severity,
      'device_id', NEW.device_id,
      'zone_id', NEW.zone_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create notifications from alerts
CREATE TRIGGER create_notification_from_alert
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_alert_notification();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.user_notification_preferences REPLICA IDENTITY FULL;
ALTER TABLE public.broadcast_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notification_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_messages;
