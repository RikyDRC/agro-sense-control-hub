
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

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'google_maps_api_key')
        .maybeSingle();

      if (error) {
        console.error('Error fetching Google Maps API key:', error);
        toast.error('Failed to load Google Maps API key');
      } else if (data) {
        setApiKey(data.value);
      }
    } catch (error) {
      console.error('Error in fetchApiKey:', error);
      toast.error('Failed to load Google Maps API key');
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    setSaving(true);
    try {
      const { data, error: checkError } = await supabase
        .from('platform_config')
        .select('id')
        .eq('key', 'google_maps_api_key')
        .maybeSingle();
      
      if (checkError) {
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
    } catch (error) {
      console.error('Error saving Google Maps API key:', error);
      toast.error('Failed to save Google Maps API key');
    } finally {
      setSaving(false);
    }
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
