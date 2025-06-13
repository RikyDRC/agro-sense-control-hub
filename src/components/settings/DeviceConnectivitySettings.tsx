
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlugZap, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/contexts/AuthContext';

const DeviceConnectivitySettings: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApiKey();
    }
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const key = await settingsService.getUserApiKey(user.id);
      setApiKey(key);
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    if (!user) return;
    
    setRegenerating(true);
    try {
      const newKey = await settingsService.generateApiKey(user.id);
      if (newKey) {
        setApiKey(newKey);
      }
    } finally {
      setRegenerating(false);
    }
  };

  const displayApiKey = () => {
    if (!apiKey) return 'No API key generated';
    if (showApiKey) return apiKey;
    return '••••••••••••••••••••••••';
  };

  return (
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
                type="text" 
                value={loading ? 'Loading...' : displayApiKey()}
                disabled
                className="font-mono"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={loading || !apiKey}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={regenerateApiKey}
                disabled={loading || regenerating}
              >
                {regenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Regenerate'
                )}
              </Button>
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
  );
};

export default DeviceConnectivitySettings;
