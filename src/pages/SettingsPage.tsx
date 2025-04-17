import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileForm from '@/components/settings/ProfileForm';
import GoogleMapsApiKey from '@/components/settings/GoogleMapsApiKey';
import { Globe, BellIcon, Settings as SettingsIcon, ShieldCheck, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  InfoIcon, Save, UserIcon, AlertCircle, PlugZap, Database, MapPin, CloudSun, Lock, Shield
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const SettingsPage: React.FC = () => {
  const { user, profile, subscription, refreshProfile, isRoleSuperAdmin, isRoleAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Show a loading state while the profile is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Loading settings...</h1>
            <p className="text-muted-foreground">Please wait while we load your profile information</p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Only redirect if user is null and loading is complete
  if (!user && !loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
            <p className="text-muted-foreground">Please sign in to access your settings</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/auth')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If we have a user but no profile yet, show a loading state
  if (user && !profile) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Loading profile...</h1>
            <p className="text-muted-foreground">Please wait while we load your profile information</p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
            <p className="text-muted-foreground">
              Manage your account, preferences, and system configuration
            </p>
          </div>
          {profile && (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {profile.profile_image ? (
                  <AvatarImage src={profile.profile_image} alt={profile.display_name || "User"} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{profile.display_name || profile.email}</h3>
                <Badge 
                  className={
                    profile.role === 'super_admin' ? 'bg-red-500' :
                    profile.role === 'admin' ? 'bg-blue-500' : 
                    'bg-green-500'
                  }
                >
                  {profile.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {profile && (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid gap-6">
                {/* Profile Form Component */}
                <ProfileForm profile={profile} refreshProfile={refreshProfile} />
                
                {/* Regional Settings */}
                <div className="grid gap-6">
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
                            value="metric" 
                            onValueChange={() => {}}
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
                            value="America/Los_Angeles" 
                            onValueChange={() => {}}
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
              </div>
            </TabsContent>
            
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
                      checked={true}
                      onCheckedChange={() => {}}
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
                        checked={true}
                        onCheckedChange={() => {}}
                        disabled={false}
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
                        checked={false}
                        onCheckedChange={() => {}}
                        disabled={false}
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
                          value="15"
                          onChange={() => {}}
                          min="5"
                          max="50"
                          className="col-span-3"
                          disabled={false}
                        />
                        <Badge>15%</Badge>
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
                          value="90"
                          onChange={() => {}}
                          min="30"
                          max="365"
                          className="col-span-3"
                        />
                        <Badge>90 days</Badge>
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
                          checked={false}
                          onCheckedChange={() => {}}
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
                
                {isRoleSuperAdmin() && <GoogleMapsApiKey />}
                
                {(isRoleSuperAdmin() || isRoleAdmin()) && (
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SettingsIcon className="h-5 w-5" /> Administrative Controls
                        </CardTitle>
                        <CardDescription>
                          Access administrative features and settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {isRoleSuperAdmin() && (
                            <div className="flex justify-between items-center p-4 border rounded-md">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <ShieldCheck className="h-4 w-4 mr-2 text-red-500" /> 
                                  Platform Configuration
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Manage API keys, system settings, and user roles
                                </p>
                              </div>
                              <Button onClick={() => navigate('/admin/config')}>
                                Manage
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center p-4 border rounded-md">
                            <div>
                              <h3 className="font-medium flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-blue-500" /> 
                                User Management
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                View and manage system users
                              </p>
                            </div>
                            <Button variant={isRoleSuperAdmin() ? "default" : "outline"}>
                              {isRoleSuperAdmin() ? 'Manage' : 'View'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
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
                      checked={false}
                      disabled
                    />
                  </div>
                  
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Enhance Your Security</AlertTitle>
                    <AlertDescription>
                      We strongly recommend enabling two-factor authentication for additional account protection.
                    </AlertDescription>
                  </Alert>
                  
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
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Log Out All Other Devices</Button>
                      <Button variant="destructive" size="sm" onClick={() => {}}>Log Out</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Subscription Management
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription plan and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isRoleSuperAdmin() || isRoleAdmin() ? (
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Admin Account</AlertTitle>
                      <AlertDescription>
                        As an admin, you have access to all features without requiring a subscription.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {subscription ? (
                        <div className="space-y-4">
                          <div className="bg-agro-green-light/20 p-4 rounded-md border border-agro-green">
                            <h3 className="font-medium text-agro-green-dark flex items-center">
                              <InfoIcon className="h-4 w-4 mr-2" /> 
                              Active Subscription
                            </h3>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Plan:</span> {subscription.plan?.name}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Price:</span> ${Number(subscription.plan?.price).toFixed(2)}/{subscription.plan?.billing_interval}
                              </p>
                              {subscription.end_date && (
                                <p className="text-sm">
                                  <span className="font-medium">Next billing date:</span> {new Date(subscription.end_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Features included:</p>
                              <ul className="text-sm space-y-1 ml-6 list-disc">
                                {subscription.plan?.features && Object.entries(subscription.plan.features).map(([key, value]) => {
                                  if (value === true) {
                                    return (
                                      <li key={key}>
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </li>
                                    );
                                  } else if (typeof value === 'number') {
                                    return (
                                      <li key={key}>
                                        {value} {key.replace(/_/g, ' ')}
                                      </li>
                                    );
                                  }
                                  return null;
                                })}
                              </ul>
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <Button onClick={() => {}}>
                                Manage Subscription
                              </Button>
                              <Button variant="outline" onClick={() => navigate('/subscription/plans')}>
                                View All Plans
                              </Button>
                            </div>
                          </div>
                          
                          <Alert>
                            <InfoIcon className="h-4 w-4" />
                            <AlertTitle>Billing Questions?</AlertTitle>
                            <AlertDescription>
                              For any billing inquiries, please contact our support team at support@agrosense.com
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No Active Subscription</AlertTitle>
                            <AlertDescription>
                              You don't have an active subscription plan. Some features may be limited.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-muted p-4 rounded-md">
                            <h3 className="font-medium">Why Subscribe?</h3>
                            <ul className="mt-2 space-y-2 ml-6 list-disc">
                              <li>Access to advanced irrigation automation</li>
                              <li>Detailed analytics and reporting</li>
                              <li>Support for more devices and zones</li>
                              <li>Premium weather forecasting</li>
                            </ul>
                            
                            <Button 
                              className="mt-4" 
                              onClick={() => navigate('/subscription/plans')}
                            >
                              View Subscription Plans
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
