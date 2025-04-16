
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Separator
} from '@/components/ui/separator';
import { 
  User, Key, Bell, Database, Shield, CloudSun, 
  Save, RefreshCw, Languages, Upload
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface SystemSettings {
  temperature: 'celsius' | 'fahrenheit';
  distance: 'metric' | 'imperial';
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  alerts: {
    lowMoisture: boolean;
    deviceOffline: boolean;
    weatherAlert: boolean;
    systemUpdate: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  dataRetention: number;
}

// Mock data
const mockUser: UserProfile = {
  id: 'user-1',
  displayName: 'John Farmer',
  email: 'john@agrosmart.com',
  phone: '+1 (555) 123-4567',
  role: 'admin',
  avatar: ''
};

const mockSettings: SystemSettings = {
  temperature: 'celsius',
  distance: 'metric',
  dateFormat: 'dd/mm/yyyy',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  alerts: {
    lowMoisture: true,
    deviceOffline: true,
    weatherAlert: true,
    systemUpdate: true
  },
  theme: 'light',
  dataRetention: 90
};

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPassword === '') {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    }, 1000);
  };

  const handleSettingsUpdate = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Settings Saved",
        description: "Your system settings have been updated successfully.",
      });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleAvatarUpload = () => {
    if (!avatar) return;
    
    setIsUpdating(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
      setAvatar(null);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-muted-foreground">Manage your account and system preferences</p>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.displayName} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            id="avatar-upload"
                            className="max-w-xs"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleAvatarUpload}
                            disabled={!avatar || isUpdating}
                          >
                            <Upload className="h-4 w-4 mr-1" /> Upload
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Maximum size 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                          id="displayName"
                          value={user.displayName}
                          onChange={(e) => setUser({...user, displayName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({...user, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={user.phone}
                          onChange={(e) => setUser({...user, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => setUser({...user, role: value})}
                          disabled
                        >
                          <SelectTrigger id="role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Farm Manager</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Role cannot be changed. Contact system administrator.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleProfileUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate one-time codes
                      </p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">SMS Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive a code via SMS to verify your identity
                      </p>
                    </div>
                    <Button variant="outline">Setup</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how you receive alerts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Channels</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts and updates via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {...settings.notifications, email: checked}
                            })
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts on your device
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {...settings.notifications, push: checked}
                            })
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts via text message
                          </p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={settings.notifications.sms}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {...settings.notifications, sms: checked}
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Alert Categories</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="moisture-alerts">Low Moisture Alerts</Label>
                        <Switch
                          id="moisture-alerts"
                          checked={settings.alerts.lowMoisture}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              alerts: {...settings.alerts, lowMoisture: checked}
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="device-alerts">Device Offline Alerts</Label>
                        <Switch
                          id="device-alerts"
                          checked={settings.alerts.deviceOffline}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              alerts: {...settings.alerts, deviceOffline: checked}
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weather-alerts">Weather Alerts</Label>
                        <Switch
                          id="weather-alerts"
                          checked={settings.alerts.weatherAlert}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              alerts: {...settings.alerts, weatherAlert: checked}
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-alerts">System Updates</Label>
                        <Switch
                          id="system-alerts"
                          checked={settings.alerts.systemUpdate}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              alerts: {...settings.alerts, systemUpdate: checked}
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSettingsUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Customize your dashboard experience and units of measurement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label>Temperature Unit</Label>
                      <RadioGroup 
                        value={settings.temperature}
                        onValueChange={(value) => 
                          setSettings({...settings, temperature: value as 'celsius' | 'fahrenheit'})
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="celsius" id="celsius" />
                          <Label htmlFor="celsius">Celsius (°C)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                          <Label htmlFor="fahrenheit">Fahrenheit (°F)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Distance Unit</Label>
                      <RadioGroup 
                        value={settings.distance}
                        onValueChange={(value) => 
                          setSettings({...settings, distance: value as 'metric' | 'imperial'})
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" />
                          <Label htmlFor="metric">Metric (m, km)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" />
                          <Label htmlFor="imperial">Imperial (ft, mi)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={settings.dateFormat} 
                        onValueChange={(value) => 
                          setSettings({...settings, dateFormat: value as any})
                        }
                      >
                        <SelectTrigger id="dateFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={settings.language} 
                        onValueChange={(value) => 
                          setSettings({...settings, language: value})
                        }
                      >
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="theme">Interface Theme</Label>
                      <Select 
                        value={settings.theme} 
                        onValueChange={(value) => 
                          setSettings({...settings, theme: value as any})
                        }
                      >
                        <SelectTrigger id="theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="dataRetention">Data Retention (days)</Label>
                      <Select 
                        value={settings.dataRetention.toString()} 
                        onValueChange={(value) => 
                          setSettings({...settings, dataRetention: parseInt(value)})
                        }
                      >
                        <SelectTrigger id="dataRetention">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSettingsUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>
                    Connect with external services and APIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Weather Service</h4>
                        <p className="text-sm text-muted-foreground">
                          OpenWeatherMap API for weather forecasts
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Connected</Badge>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Google Maps</h4>
                        <p className="text-sm text-muted-foreground">
                          Mapping and geolocation services
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500">Setup Required</Badge>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">MQTT Broker</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time device communication
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Connected</Badge>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    Details about your installation and database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Version</span>
                      <span className="text-sm">AgroSense Hub v1.0.0</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-sm">June 15, 2023</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Database Size</span>
                      <span className="text-sm">42.3 MB</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Devices</span>
                      <span className="text-sm">12</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Zones</span>
                      <span className="text-sm">4</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
