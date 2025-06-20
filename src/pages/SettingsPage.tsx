import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/settings/ProfileForm';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import DeviceConnectivitySettings from '@/components/settings/DeviceConnectivitySettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  AlertCircle, ShieldCheck, CreditCard, Shield, InfoIcon
} from 'lucide-react';
import { settingsService, UserSettings, defaultSettings } from '@/services/settingsService';

const SettingsPage: React.FC = () => {
  const { user, profile, subscription, refreshProfile, isRoleSuperAdmin, isRoleAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [fallbackUserRole, setFallbackUserRole] = useState<'super_admin' | 'admin' | 'farmer' | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  
  // Improved profile loading logic
  useEffect(() => {
    const initializeFallbackRole = async () => {
      if (user && !profile) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role, display_name, email')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setFallbackUserRole(data.role);
            console.log("Set fallback role from direct query:", data.role);
          }
        } catch (err) {
          console.error("Error fetching fallback role:", err);
          // Default to farmer role if we can't determine the actual role
          setFallbackUserRole('farmer');
        }
      }
    };
    
    if (user && !profile && !fallbackUserRole) {
      initializeFallbackRole();
    }
  }, [user, profile, fallbackUserRole]);
  
  // More aggressive profile refresh
  useEffect(() => {
    if (user && !profile) {
      console.log("Attempting to refresh profile from settings page");
      refreshProfile().catch(err => {
        console.error("Error refreshing profile:", err);
      });
    }
    
    // Add a secondary refresh after a short delay
    if (user && !profile) {
      const delayedRefresh = setTimeout(() => {
        refreshProfile().catch(err => {
          console.error("Error in delayed profile refresh:", err);
        });
      }, 1000);
      
      return () => clearTimeout(delayedRefresh);
    }
  }, [user, profile, refreshProfile]);
  
  // Faster loading transition
  useEffect(() => {
    console.log("Settings page status - loading:", loading, "profile:", !!profile, "fallbackRole:", fallbackUserRole);
    
    if (!loading && (profile || fallbackUserRole)) {
      setIsPageLoading(false);
    }
    
    const safetyTimer = setTimeout(() => {
      console.log("Safety timeout triggered in settings page");
      setIsPageLoading(false);
    }, 1000); // Reduced timeout from 2000 to 1000 ms
    
    return () => clearTimeout(safetyTimer);
  }, [loading, profile, fallbackUserRole]);
  
  // Load user settings
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const settings = await settingsService.getUserSettings(user.id);
      setUserSettings(settings);
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await settingsService.saveUserSettings(user.id, userSettings);
    } finally {
      setSaving(false);
    }
  };

  const hasAdminRights = () => {
    if (profile) {
      return profile.role === 'super_admin' || profile.role === 'admin';
    }
    return fallbackUserRole === 'super_admin' || fallbackUserRole === 'admin';
  };
  
  const hasSuperAdminRights = () => {
    if (profile) {
      return profile.role === 'super_admin';
    }
    return fallbackUserRole === 'super_admin';
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
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

  const renderProfileDisplay = () => {
    if (profile) {
      return (
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
      );
    } else if (user) {
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-white text-lg">
              {user.email ? user.email.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.email || "User"}</h3>
            <Badge className={fallbackUserRole === 'super_admin' ? 'bg-red-500' : 
                             fallbackUserRole === 'admin' ? 'bg-blue-500' : 'bg-green-500'}>
              {fallbackUserRole ? (fallbackUserRole === 'super_admin' ? 'super admin' : fallbackUserRole) : 'User'}
            </Badge>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (isPageLoading) {
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
            {renderProfileDisplay()}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile && !fallbackUserRole) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Available</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load your profile information. This might be due to database permission issues. 
            Please try refreshing the page or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => refreshProfile()}>
              Retry Loading Profile
            </Button>
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
          {renderProfileDisplay()}
        </div>

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
              {profile ? (
                <ProfileForm profile={profile} refreshProfile={refreshProfile} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                      Profile information is currently unavailable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Profile Data Unavailable</AlertTitle>
                      <AlertDescription>
                        We're having trouble loading your profile information. This might be due to a database issue. 
                        Basic functionality will still work, but some personalized features may be limited.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
              
              <PreferencesSettings
                settings={userSettings}
                onSettingsChange={setUserSettings}
                onSave={handleSaveSettings}
                saving={saving}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="system">
            <div className="grid gap-6">
              {hasSuperAdminRights() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Administrative Controls</CardTitle>
                    <CardDescription>
                      Access administrative features and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hasSuperAdminRights() && (
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
                      
                      {hasSuperAdminRights() && (
                        <div className="flex justify-between items-center p-4 border rounded-md">
                          <div>
                            <h3 className="font-medium flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-blue-500" /> 
                              Payment Gateways
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configure payment processors and checkout options
                            </p>
                          </div>
                          <Button onClick={() => navigate('/admin/payment-gateways')}>
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
                        <Button variant={hasSuperAdminRights() ? "default" : "outline"}>
                          {hasSuperAdminRights() ? 'Manage' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <DeviceConnectivitySettings />
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings />
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
                          
                          <div className="mt-4 flex gap-2">
                            <Button onClick={() => {}}>
                              Manage Subscription
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/subscription/plans')}>
                              View All Plans
                            </Button>
                          </div>
                        </div>
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
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
