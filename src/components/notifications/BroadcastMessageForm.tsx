
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Clock, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface BroadcastMessageFormProps {
  onSuccess?: () => void;
}

const BroadcastMessageForm: React.FC<BroadcastMessageFormProps> = ({ onSuccess }) => {
  const { user, isRoleAdmin, isRoleSuperAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'error' | 'success' | 'maintenance'>('info');
  const [targetAudience, setTargetAudience] = useState<'all' | 'farmers' | 'admins'>('all');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!isRoleAdmin() && !isRoleSuperAdmin())) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to send broadcast messages",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and message",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      // Create broadcast message
      const { data: broadcastData, error: broadcastError } = await supabase
        .from('broadcast_messages')
        .insert({
          created_by: user.id,
          title: title.trim(),
          message: message.trim(),
          type,
          target_audience: targetAudience,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (broadcastError) throw broadcastError;

      // Call edge function to send notifications
      const { error: sendError } = await supabase.functions.invoke('send-broadcast-notification', {
        body: {
          broadcastId: broadcastData.id,
          title: title.trim(),
          message: message.trim(),
          type,
          targetAudience
        }
      });

      if (sendError) throw sendError;

      toast({
        title: "Success",
        description: "Broadcast message sent successfully",
      });

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setTargetAudience('all');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error sending broadcast message:', err);
      toast({
        title: "Error",
        description: "Failed to send broadcast message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!isRoleAdmin() && !isRoleSuperAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">You don't have permission to send broadcast messages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Broadcast Message
        </CardTitle>
        <CardDescription>
          Send notifications to all users or specific groups
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Message Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={(value: any) => setTargetAudience(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="farmers">Farmers Only</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              This message will be sent to: 
            </span>
            <Badge variant="outline">
              {targetAudience === 'all' ? 'All Users' : 
               targetAudience === 'farmers' ? 'Farmers' : 'Administrators'}
            </Badge>
          </div>

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Broadcast Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BroadcastMessageForm;
