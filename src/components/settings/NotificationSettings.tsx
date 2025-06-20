
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellIcon, InfoIcon, Save } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/components/ui/use-toast';

const NotificationSettings: React.FC = () => {
  const { preferences, loading, saving, savePreferences } = useNotificationPreferences();
  const { notifications } = useNotifications();

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    const updatedPreferences = { ...preferences, [key]: value };
    savePreferences(updatedPreferences);
  };

  // Request notification permission when push notifications are enabled
  useEffect(() => {
    if (preferences.pushNotificationsEnabled && 'Notification' in window) {
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
  }, [preferences.pushNotificationsEnabled]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading notification settings...</div>
        </CardContent>
      </Card>
    );
  }

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
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications on your device
              </p>
            </div>
            <Switch 
              id="push-notifications" 
              checked={preferences.pushNotificationsEnabled}
              onCheckedChange={(checked) => handleToggle('pushNotificationsEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={preferences.emailNotificationsEnabled}
              onCheckedChange={(checked) => handleToggle('emailNotificationsEnabled', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Alert Categories</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="device-alerts">Device Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for device failures and status changes
                </p>
              </div>
              <Switch 
                id="device-alerts" 
                checked={preferences.deviceAlerts}
                onCheckedChange={(checked) => handleToggle('deviceAlerts', checked)}
                disabled={!preferences.pushNotificationsEnabled && !preferences.emailNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="irrigation-alerts">Irrigation Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for irrigation schedules and completion
                </p>
              </div>
              <Switch 
                id="irrigation-alerts" 
                checked={preferences.irrigationAlerts}
                onCheckedChange={(checked) => handleToggle('irrigationAlerts', checked)}
                disabled={!preferences.pushNotificationsEnabled && !preferences.emailNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-alerts">System Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for system issues and updates
                </p>
              </div>
              <Switch 
                id="system-alerts" 
                checked={preferences.systemAlerts}
                onCheckedChange={(checked) => handleToggle('systemAlerts', checked)}
                disabled={!preferences.pushNotificationsEnabled && !preferences.emailNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for scheduled maintenance and reminders
                </p>
              </div>
              <Switch 
                id="maintenance-alerts" 
                checked={preferences.maintenanceAlerts}
                onCheckedChange={(checked) => handleToggle('maintenanceAlerts', checked)}
                disabled={!preferences.pushNotificationsEnabled && !preferences.emailNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="broadcast-messages">Broadcast Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications from administrators and system announcements
                </p>
              </div>
              <Switch 
                id="broadcast-messages" 
                checked={preferences.broadcastMessages}
                onCheckedChange={(checked) => handleToggle('broadcastMessages', checked)}
                disabled={!preferences.pushNotificationsEnabled && !preferences.emailNotificationsEnabled}
              />
            </div>
          </div>
          
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Notifications</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-muted-foreground">{notification.message}</div>
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
      </Card>
    </div>
  );
};

export default NotificationSettings;
