
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface NotificationPreferences {
  id?: string;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  deviceAlerts: boolean;
  irrigationAlerts: boolean;
  systemAlerts: boolean;
  maintenanceAlerts: boolean;
  broadcastMessages: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotificationsEnabled: true,
    emailNotificationsEnabled: true,
    deviceAlerts: true,
    irrigationAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    broadcastMessages: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          id: data.id,
          pushNotificationsEnabled: data.push_notifications_enabled,
          emailNotificationsEnabled: data.email_notifications_enabled,
          deviceAlerts: data.device_alerts,
          irrigationAlerts: data.irrigation_alerts,
          systemAlerts: data.system_alerts,
          maintenanceAlerts: data.maintenance_alerts,
          broadcastMessages: data.broadcast_messages,
          quietHoursStart: data.quiet_hours_start,
          quietHoursEnd: data.quiet_hours_end,
        });
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          push_notifications_enabled: newPreferences.pushNotificationsEnabled,
          email_notifications_enabled: newPreferences.emailNotificationsEnabled,
          device_alerts: newPreferences.deviceAlerts,
          irrigation_alerts: newPreferences.irrigationAlerts,
          system_alerts: newPreferences.systemAlerts,
          maintenance_alerts: newPreferences.maintenanceAlerts,
          broadcast_messages: newPreferences.broadcastMessages,
          quiet_hours_start: newPreferences.quietHoursStart,
          quiet_hours_end: newPreferences.quietHoursEnd,
        });

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: "Success",
        description: "Notification preferences saved successfully",
      });
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    refetch: fetchPreferences
  };
};
