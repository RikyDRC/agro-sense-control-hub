
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, Save, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const GoogleMapsApiKey: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Check if user is a super admin using the security definer function
        const { data: isSuperAdmin, error: checkError } = await supabase.rpc('is_current_user_super_admin');
        
        if (checkError) {
          console.error('Error checking super admin status:', checkError);
          if (isMounted) {
            setLoadError(checkError.message);
            toast.error('Failed to verify permissions: ' + checkError.message);
            setIsLoading(false);
          }
          return;
        }
        
        if (!isSuperAdmin) {
          if (isMounted) {
            setAccessDenied(true);
            setIsLoading(false);
          }
          return;
        }
        
        // Try to fetch the API key
        const { data, error } = await supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'google_maps_api_key')
          .maybeSingle();

        if (error) {
          console.error('Error fetching Google Maps API key:', error);
          if (isMounted) {
            setLoadError(error.message);
            toast.error('Failed to load Google Maps API key: ' + error.message);
          }
        } else if (data && isMounted) {
          setApiKey(data.value || '');
        }
      } catch (error: any) {
        console.error('Error in fetchApiKey:', error);
        if (isMounted) {
          setLoadError(error.message);
          toast.error('Failed to load Google Maps API key: ' + error.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Safety timeout to prevent indefinite loading
    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 1500);
    
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const saveApiKey = async () => {
    setSaving(true);
    try {
      const { data, error: checkError } = await supabase
        .from('platform_config')
        .select('id')
        .eq('key', 'google_maps_api_key')
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking for existing API key:', checkError);
        throw checkError;
      }
      
      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('platform_config')
          .update({ 
            value: apiKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('platform_config')
          .insert({
            key: 'google_maps_api_key',
            value: apiKey,
            description: 'Google Maps API Key for map functionality'
          });
          
        if (error) throw error;
      }
      
      toast.success('Google Maps API key saved successfully');
    } catch (error: any) {
      console.error('Error saving Google Maps API key:', error);
      toast.error('Failed to save Google Maps API key: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    // Re-mount the component to trigger the useEffect again
    setTimeout(() => {
      location.reload();
    }, 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (accessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Google Maps API Key
          </CardTitle>
          <CardDescription className="text-red-500">
            Access Denied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Only Super Administrators can view and manage API keys. Please contact your system administrator for assistance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Google Maps API Key
          </CardTitle>
          <CardDescription className="text-red-500">
            Error loading configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              There was a problem loading the Google Maps API key: {loadError}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetry}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Google Maps API Key
        </CardTitle>
        <CardDescription>
          Configure the Google Maps API key for map-related functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maps-api-key">API Key</Label>
          <div className="flex">
            <Input
              id="maps-api-key"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              placeholder="Enter Google Maps API Key"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
              className="ml-2"
              type="button"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription>
            You can get a Google Maps API key from the <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>. Make sure to enable the Maps JavaScript API.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={saveApiKey} disabled={saving}>
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleMapsApiKey;
