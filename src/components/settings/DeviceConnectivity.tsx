
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Loader2, Copy, QrCode, RefreshCw, Key, ServerCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DeviceConnectivity: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [mqttEnabled, setMqttEnabled] = useState(false);
  const [mqttUrl, setMqttUrl] = useState('');
  const [mqttUsername, setMqttUsername] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchConnectivitySettings();
    }
  }, [user]);

  const fetchConnectivitySettings = async () => {
    try {
      setLoading(true);
      
      // Fetch API key from platform_config
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('platform_config')
        .select('*')
        .eq('key', `user_api_key_${user?.id}`)
        .single();
      
      if (apiKeyError && apiKeyError.code !== 'PGRST116') { // PGRST116 is "No rows found" error
        throw apiKeyError;
      }
      
      if (apiKeyData) {
        setApiKey(apiKeyData.value);
      } else {
        // Generate new API key if none exists
        generateApiKey();
      }
      
      // Fetch MQTT settings
      const { data: mqttData, error: mqttError } = await supabase
        .from('platform_config')
        .select('*')
        .eq('key', `mqtt_settings_${user?.id}`)
        .single();
      
      if (mqttError && mqttError.code !== 'PGRST116') {
        throw mqttError;
      }
      
      if (mqttData) {
        const mqttSettings = JSON.parse(mqttData.value);
        setMqttEnabled(mqttSettings.enabled || false);
        setMqttUrl(mqttSettings.url || '');
        setMqttUsername(mqttSettings.username || '');
        setMqttPassword(mqttSettings.password || '');
      }
    } catch (error) {
      console.error('Error fetching connectivity settings:', error);
      toast.error('Failed to load connectivity settings');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      // Generate a random API key
      const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newApiKey = `agrosense_${user?.id.substring(0, 8)}_${randomKey}`;
      setApiKey(newApiKey);
      
      // Save to database
      const { error } = await supabase
        .from('platform_config')
        .upsert({
          key: `user_api_key_${user?.id}`,
          value: newApiKey,
          description: `API key for user ${profile?.display_name || user?.email}`,
          updated_by: user?.id
        });
      
      if (error) throw error;
      
      toast.success('New API key generated');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key');
    }
  };

  const saveMqttSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const mqttSettings = {
        enabled: mqttEnabled,
        url: mqttUrl,
        username: mqttUsername,
        password: mqttPassword
      };
      
      const { error } = await supabase
        .from('platform_config')
        .upsert({
          key: `mqtt_settings_${user.id}`,
          value: JSON.stringify(mqttSettings),
          description: `MQTT settings for user ${profile?.display_name || user.email}`,
          updated_by: user.id
        });
      
      if (error) throw error;
      
      toast.success('MQTT settings saved');
    } catch (error) {
      console.error('Error saving MQTT settings:', error);
      toast.error('Failed to save MQTT settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Connectivity</CardTitle>
          <CardDescription>Loading connectivity settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Connectivity</CardTitle>
        <CardDescription>
          Configure how your devices connect to the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="mqtt">MQTT</TabsTrigger>
            <TabsTrigger value="device-ids">Device IDs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex space-x-2">
                <Input 
                  id="api-key" 
                  value={apiKey} 
                  readOnly 
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(apiKey, 'API key copied to clipboard')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use this key to authenticate API requests from your devices
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={generateApiKey}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate API Key
            </Button>
            
            <div className="rounded-md bg-muted p-4 mt-4">
              <h3 className="font-semibold mb-2">Sample HTTP Request</h3>
              <pre className="text-xs overflow-x-auto bg-slate-950 text-slate-50 p-2 rounded">
{`curl -X POST https://api.agrosense.io/v1/readings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "device_id": "your-device-id",
    "value": 42.5,
    "unit": "C",
    "timestamp": "2023-05-02T12:34:56Z"
  }'`}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="mqtt" className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="mqtt-enabled" 
                checked={mqttEnabled}
                onCheckedChange={setMqttEnabled}
              />
              <Label htmlFor="mqtt-enabled">Enable MQTT</Label>
            </div>
            
            {mqttEnabled && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="mqtt-url">MQTT Broker URL</Label>
                  <Input 
                    id="mqtt-url" 
                    placeholder="mqtt://broker.example.com:1883" 
                    value={mqttUrl}
                    onChange={(e) => setMqttUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mqtt-username">Username</Label>
                  <Input 
                    id="mqtt-username" 
                    placeholder="MQTT username" 
                    value={mqttUsername}
                    onChange={(e) => setMqttUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mqtt-password">Password</Label>
                  <Input 
                    id="mqtt-password" 
                    type="password"
                    placeholder="MQTT password" 
                    value={mqttPassword}
                    onChange={(e) => setMqttPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={saveMqttSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save MQTT Settings'
                  )}
                </Button>
                
                <div className="rounded-md bg-muted p-4 mt-2">
                  <h3 className="font-semibold mb-2">MQTT Topics</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Publish data:</p>
                      <code className="text-xs bg-slate-950 text-slate-50 p-1 rounded">agrosense/{user?.id}/devices/+/data</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subscribe to commands:</p>
                      <code className="text-xs bg-slate-950 text-slate-50 p-1 rounded">agrosense/{user?.id}/devices/+/commands</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="device-ids" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Each of your devices has a unique ID. You can find these IDs on the Devices page. 
              Use these IDs when sending data from your devices to the platform.
            </p>
            
            <Button 
              onClick={() => navigate('/devices')}
              variant="outline"
            >
              Go to Devices
            </Button>
            
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-semibold mb-2">QR Code Generation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can generate QR codes for your devices to make setup easier.
                Visit a device's details page to access its QR code.
              </p>
              <div className="flex justify-center py-4 bg-muted rounded-md">
                <QrCode className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeviceConnectivity;
