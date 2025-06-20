
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
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
  const { t } = useTranslation('connectivity');
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
      // We need to use a type cast here since our Supabase types haven't been updated yet
      const { data, error } = await supabase
        .from('device_api_keys')
        .select('*')
        .eq('user_id', userId) as any;
      
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Error",
        description: 'Failed to load API keys',
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: t('noApiKeys'),
        variant: "destructive"
      });
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
        }) as any;
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: 'API key created successfully'
      });
      setNewKeyName('');
      loadApiKeys();
      
      setTimeout(() => {
        setShowKeys(prev => ({
          ...prev,
          [newKey]: true
        }));
      }, 300);
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: 'Failed to create API key',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async (id: string) => {
    try {
      setRegenerating(prev => ({ ...prev, [id]: true }));
      
      const newKey = generateApiKey();
      // Type cast
      const { error } = await supabase
        .from('device_api_keys')
        .update({ key: newKey })
        .eq('id', id) as any;
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: 'API key regenerated successfully'
      });
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
      toast({
        title: "Error",
        description: 'Failed to regenerate API key',
        variant: "destructive"
      });
    } finally {
      setRegenerating(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Type cast
      const { error } = await supabase
        .from('device_api_keys')
        .delete()
        .eq('id', id) as any;
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: 'API key deleted successfully'
      });
      loadApiKeys();
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: 'Failed to delete API key',
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({
        title: "Success",
        description: 'Copied to clipboard'
      }))
      .catch(() => toast({
        title: "Error",
        description: 'Failed to copy',
        variant: "destructive"
      }));
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
            {t('apiKeyManagement')}
          </CardTitle>
          <CardDescription>
            {t('apiKeyDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">{t('newApiKeyName')}</Label>
            <div className="flex space-x-2">
              <Input
                id="name"
                placeholder={t('apiKeyPlaceholder')}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button 
                onClick={createApiKey} 
                disabled={loading || !newKeyName.trim()}
              >
                {t('createKey')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('yourApiKeys')}</Label>
            {loading ? (
              <div className="text-center py-4">Loading API keys...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                {t('noApiKeys')}
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
            <strong>{t('securityNote')}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('exampleUsage')} <code className="bg-muted p-1 rounded">curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/data</code>
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('deviceIntegrationGuide')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{t('httpRestApi')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('restApiDescription')}
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
