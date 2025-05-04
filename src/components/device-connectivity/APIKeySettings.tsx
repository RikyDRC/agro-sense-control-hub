
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

interface APIKeySettingsProps {
  userId?: string;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ userId }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userId) {
      loadApiKeys();
    }
  }, [userId]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('device_api_keys')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    // Generate a pseudo-random key with a specific format
    const key = `iot_${uuidv4().replace(/-/g, '')}_${Math.random().toString(36).substring(2, 8)}`;
    return key;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    
    try {
      setLoading(true);
      const newKey = generateApiKey();
      
      const { error } = await supabase
        .from('device_api_keys')
        .insert({
          name: newKeyName,
          key: newKey,
          user_id: userId
        });
      
      if (error) throw error;
      
      toast.success('API key created successfully');
      setNewKeyName('');
      loadApiKeys();
      
      // Show the new key automatically
      setTimeout(() => {
        setShowKeys(prev => ({
          ...prev,
          [newKey]: true
        }));
      }, 300);
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async (id: string) => {
    try {
      setRegenerating(prev => ({ ...prev, [id]: true }));
      
      const newKey = generateApiKey();
      const { error } = await supabase
        .from('device_api_keys')
        .update({ key: newKey })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('API key regenerated successfully');
      loadApiKeys();
      
      // Show the regenerated key automatically
      setTimeout(() => {
        setShowKeys(prev => ({
          ...prev,
          [newKey]: true
        }));
      }, 300);
    } catch (error: any) {
      console.error('Error regenerating API key:', error);
      toast.error('Failed to regenerate API key');
    } finally {
      setRegenerating(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('device_api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('API key deleted successfully');
      loadApiKeys();
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            API keys allow your IoT devices to securely connect to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">New API Key Name</Label>
            <div className="flex space-x-2">
              <Input
                id="name"
                placeholder="e.g., Greenhouse Sensors"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button 
                onClick={createApiKey} 
                disabled={loading || !newKeyName.trim()}
              >
                Create Key
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your API Keys</Label>
            {apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No API keys created yet. Create your first key above.
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex flex-col space-y-3 p-4 border rounded-lg bg-muted/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(apiKey.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => regenerateApiKey(apiKey.id)}
                          disabled={regenerating[apiKey.id]}
                        >
                          <RefreshCw className={`h-4 w-4 ${regenerating[apiKey.id] ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showKeys[apiKey.key] ? "text" : "password"}
                        value={apiKey.key}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleShowKey(apiKey.key)}
                      >
                        {showKeys[apiKey.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Security note:</strong> Store these keys securely. They provide access to your farm data.
          </p>
          <p className="text-xs text-muted-foreground">
            Example usage: <code className="bg-muted p-1 rounded">curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/data</code>
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">HTTP REST API</h4>
              <p className="text-sm text-muted-foreground">
                Use your API key in the Authorization header when making requests to our REST API.
              </p>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
{`// Example with Arduino/ESP8266
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

HTTPClient http;
WiFiClient client;
http.begin(client, "https://api.example.com/data");
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", "Bearer YOUR_API_KEY");
int httpResponseCode = http.POST("{\\"sensor\\":\\"moisture\\",\\"value\\":45}");`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeySettings;
