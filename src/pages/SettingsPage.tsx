
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, Save, UserIcon, BellIcon, Globe, Lock, ShieldCheck, Database, PlugZap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole } from '@/types';

// Mock user
const currentUser = {
  id: '1',
  displayName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: UserRole.ADMIN,
  farmName: 'Green Valley Farm',
  location: 'California, USA',
  measurementUnit: 'metric',
  timeZone: 'America/Los_Angeles',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  alertThreshold: 15,
  dataRetentionDays: 90,
  darkMode: false,
  twoFactorEnabled: false,
  language: 'en-US',
  lastLogin: '2025-03-15T14:30:00Z'
};

const SettingsPage: React.FC = () => {
  const [userSettings, setUserSettings] = useState(currentUser);
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleToggleChange = (field: string) => (checked: boolean) => {
    setUserSettings({
      ...userSettings,
      [field]: checked
    });
  };
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSettings({
      ...userSettings,
      [field]: e.target.value
    });
  };
  
  const handleSelectChange = (field: string) => (value: string) => {
    setUserSettings({
      ...userSettings,
      [field]: value
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and system configuration
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" /> User Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          value={userSettings.displayName} 
                          onChange={handleInputChange('displayName')} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={userSettings.email} 
                          onChange={handleInputChange('email')} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input 
                          id="farmName" 
                          value={userSettings.farmName} 
                          onChange={handleInputChange('farmName')} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          value={userSettings.location} 
                          onChange={handleInputChange('location')} 
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">User Role</Label>
                        <Select 
                          value={userSettings.role} 
                          onValueChange={handleSelectChange('role')}
                          disabled
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserRole).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact your administrator to change roles
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={userSettings.language} 
                          onValueChange={handleSelectChange('language')}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                            <SelectItem value="fr-FR">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" /> Regional Settings
                  </CardTitle>
                  <CardDescription>
                    Configure regional preferences for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurementUnit">Measurement Units</Label>
                      <Select 
                        value={userSettings.measurementUnit} 
                        onValueChange={handleSelectChange('measurementUnit')}
                      >
                        <SelectTrigger id="measurementUnit">
                          <SelectValue placeholder="Select unit system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (°C, mm, km)</SelectItem>
                          <SelectItem value="imperial">Imperial (°F, in, mi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select 
                        value={userSettings.timeZone} 
                        onValueChange={handleSelectChange('timeZone')}
                      >
                        <SelectTrigger id="timeZone">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="Europe/London">GMT/UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
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
                    checked={userSettings.notificationsEnabled}
                    onCheckedChange={handleToggleChange('notificationsEnabled')}
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
                      checked={userSettings.emailNotifications}
                      onCheckedChange={handleToggleChange('emailNotifications')}
                      disabled={!userSettings.notificationsEnabled}
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
                      checked={userSettings.pushNotifications}
                      onCheckedChange={handleToggleChange('pushNotifications')}
                      disabled={!userSettings.notificationsEnabled}
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
                        value={userSettings.alertThreshold.toString()} 
                        onChange={handleInputChange('alertThreshold')}
                        min="5"
                        max="50"
                        className="col-span-3"
                        disabled={!userSettings.notificationsEnabled}
                      />
                      <Badge>{userSettings.alertThreshold}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts when moisture levels deviate from ideal by this percentage
                    </p>
                  </div>
                </div>
                
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Email Verification</AlertTitle>
                  <AlertDescription>
                    To receive email notifications, please ensure your email address is verified.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> Data Management
                  </CardTitle>
                  <CardDescription>
                    Configure how your data is stored and managed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <Input 
                        id="dataRetention" 
                        type="number" 
                        value={userSettings.dataRetentionDays.toString()} 
                        onChange={handleInputChange('dataRetentionDays')}
                        min="30"
                        max="365"
                        className="col-span-3"
                      />
                      <Badge>{userSettings.dataRetentionDays} days</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sensor data older than this will be automatically archived
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">App Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable dark theme for the application
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={userSettings.darkMode}
                        onCheckedChange={handleToggleChange('darkMode')}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlugZap className="h-5 w-5" /> Device Connectivity
                  </CardTitle>
                  <CardDescription>
                    Manage device connection settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="apiKey" 
                          type="password" 
                          value="••••••••••••••••••••••••"
                          disabled
                          className="font-mono"
                        />
                        <Button variant="outline" size="sm">Reveal</Button>
                        <Button variant="outline" size="sm">Regenerate</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for device integrations and external connections
                      </p>
                    </div>
                    
                    <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Security Notice</AlertTitle>
                      <AlertDescription>
                        Keep your API key secret. If compromised, regenerate it immediately.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Security Settings
                </CardTitle>
                <CardDescription>
                  Manage account security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include uppercase, lowercase, number, and special character
                  </p>
                  
                  <Button size="sm" className="mt-2">Change Password</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={userSettings.twoFactorEnabled}
                    onCheckedChange={handleToggleChange('twoFactorEnabled')}
                  />
                </div>
                
                {!userSettings.twoFactorEnabled && (
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Enhance Your Security</AlertTitle>
                    <AlertDescription>
                      We strongly recommend enabling two-factor authentication for additional account protection.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Active Sessions</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Started: {new Date().toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">IP: 192.168.1.1</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">Log Out All Other Devices</Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" /> Save Security Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
