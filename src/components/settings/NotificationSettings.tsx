
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellIcon, InfoIcon, Save } from 'lucide-react';
import { UserSettings } from '@/services/settingsService';
import { useAlerts } from '@/hooks/useAlerts';
import { toast } from '@/components/ui/use-toast';

interface NotificationSettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onSave: () => void;
  saving: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  saving
}) => {
  const { alerts, loading: alertsLoading } = useAlerts();

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: any) => {
    onSettingsChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  // Real-time notification handling
  useEffect(() => {
    if (settings.notifications.enabled && 'Notification' in window) {
      // Request notification permission if not already granted
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled",
              description: "You'll now receive real-time alerts",
            });
          }
        });
      }
    }
  }, [settings.notifications.enabled]);

  // Monitor for new alerts and show notifications
  useEffect(() => {
    if (!settings.notifications.enabled || !alerts.length) return;

    const latestAlert = alerts[0];
    if (!latestAlert.isRead && Notification.permission === 'granted') {
      new Notification(`AgroSense Alert: ${latestAlert.title}`, {
        body: latestAlert.message,
        icon: '/favicon.ico',
        tag: latestAlert.id,
      });
    }
  }, [alerts, settings.notifications.enabled]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" /> Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all notifications
              </p>
            </div>
            <Switch 
              id="notifications-enabled" 
              checked={settings.notifications.enabled}
              onCheckedChange={(checked) => updateNotificationSetting('enabled', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Channels</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                disabled={!settings.notifications.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={settings.notifications.push}
                onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                disabled={!settings.notifications.enabled}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Alert Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
              <div className="grid grid-cols-4 gap-4 items-center">
                <Input 
                  id="alertThreshold" 
                  type="number" 
                  value={settings.notifications.alertThreshold}
                  onChange={(e) => updateNotificationSetting('alertThreshold', parseInt(e.target.value) || 15)}
                  min="5"
                  max="50"
                  className="col-span-3"
                  disabled={!settings.notifications.enabled}
                />
                <Badge>{settings.notifications.alertThreshold}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receive alerts when moisture levels deviate from ideal by this percentage
              </p>
            </div>
          </div>
          
          {!alertsLoading && alerts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Alerts</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-muted-foreground">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Real-time Notifications</AlertTitle>
            <AlertDescription>
              When enabled, you'll receive instant browser notifications for critical alerts and system updates.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationSettings;
