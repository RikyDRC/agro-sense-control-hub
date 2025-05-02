
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const DeviceConnectivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<Array<{id: string, key: string, created_at: string}>>([]);
  const [mqttSettings, setMqttSettings] = useState({
    enabled: false,
    broker_url: 'mqtt.example.com',
    port: 8883,
    username: '',
    password: '',
    client_id: ''
  });
  const [deviceIds, setDeviceIds] = useState<Array<{id: string, name: string}>>([]);

  // Simulated data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API keys
        setApiKeys([
          {
            id: '1',
            key: 'sk_test_' + uuidv4().replace(/-/g, ''),
            created_at: new Date().toISOString()
          }
        ]);
        
        // Simulate device IDs
        setDeviceIds([
          { id: 'dev_001', name: 'Moisture Sensor A1' },
          { id: 'dev_002', name: 'Valve B1' },
          { id: 'dev_003', name: 'Temperature Sensor C1' }
        ]);
        
        // Simulate a delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading connectivity data:', error);
        toast.error('Failed to load connectivity settings');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user?.id]);

  const handleCreateApiKey = () => {
    const newKey = {
      id: uuidv4(),
      key: 'sk_test_' + uuidv4().replace(/-/g, ''),
      created_at: new Date().toISOString()
    };
    setApiKeys(prev => [...prev, newKey]);
    toast.success('New API key generated');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast.success('API key deleted');
  };

  const handleSaveMqttSettings = () => {
    toast.success('MQTT settings saved');
  };

  // Simulate subscription check
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  
  useEffect(() => {
    // Simulate checking user's subscription tier
    const checkSubscription = async () => {
      // In a real app, this would fetch from your database
      setSubscriptionTier('free');
    };
    
    checkSubscription();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Device Connectivity</CardTitle>
        <CardDescription>Manage how your devices connect to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="api">
          <TabsList className="mb-4">
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="mqtt">MQTT Settings</TabsTrigger>
            <TabsTrigger value="devices">Device IDs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">About API Keys</h3>
              <p className="text-sm text-muted-foreground mb-2">
                API keys allow secure access to your farm data from external applications 
                and integrations. Keep your keys secure and never share them publicly.
              </p>
              <p className="text-xs text-muted-foreground">
                Note: Free tier users are limited to 1 API key.
              </p>
            </div>
            
            <div className="space-y-4">
              {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-mono text-sm mb-1">
                      {apiKey.key.substring(0, 10)}...{apiKey.key.substring(apiKey.key.length - 4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(apiKey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey.key);
                        toast.success('API key copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={handleCreateApiKey}
              disabled={subscriptionTier === 'free' && apiKeys.length >= 1}
            >
              Generate New API Key
            </Button>
            
            {subscriptionTier === 'free' && apiKeys.length >= 1 && (
              <p className="text-xs text-amber-600 mt-2">
                Free tier is limited to 1 API key. 
                <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/subscription/plans')}>
                  Upgrade your plan
                </Button>
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="mqtt" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">About MQTT Connectivity</h3>
              <p className="text-sm text-muted-foreground">
                MQTT is a lightweight messaging protocol for IoT devices. Configure these settings to enable 
                your devices to publish sensor data and subscribe to control commands.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mqtt-enabled">Enable MQTT</Label>
                  <p className="text-xs text-muted-foreground">Allow devices to connect via MQTT protocol</p>
                </div>
                <Switch 
                  id="mqtt-enabled" 
                  checked={mqttSettings.enabled}
                  onCheckedChange={(checked) => setMqttSettings({...mqttSettings, enabled: checked})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="broker-url">MQTT Broker URL</Label>
                  <Input 
                    id="broker-url" 
                    value={mqttSettings.broker_url} 
                    onChange={(e) => setMqttSettings({...mqttSettings, broker_url: e.target.value})}
                    disabled={!mqttSettings.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broker-port">Port</Label>
                  <Input 
                    id="broker-port" 
                    type="number"
                    value={mqttSettings.port} 
                    onChange={(e) => setMqttSettings({...mqttSettings, port: parseInt(e.target.value)})}
                    disabled={!mqttSettings.enabled}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mqtt-username">Username</Label>
                  <Input 
                    id="mqtt-username" 
                    value={mqttSettings.username} 
                    onChange={(e) => setMqttSettings({...mqttSettings, username: e.target.value})}
                    disabled={!mqttSettings.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mqtt-password">Password</Label>
                  <Input 
                    id="mqtt-password" 
                    type="password"
                    value={mqttSettings.password} 
                    onChange={(e) => setMqttSettings({...mqttSettings, password: e.target.value})}
                    disabled={!mqttSettings.enabled}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input 
                  id="client-id" 
                  value={mqttSettings.client_id} 
                  onChange={(e) => setMqttSettings({...mqttSettings, client_id: e.target.value})}
                  disabled={!mqttSettings.enabled}
                />
                <p className="text-xs text-muted-foreground">Leave blank to auto-generate</p>
              </div>
              
              <Button onClick={handleSaveMqttSettings} disabled={!mqttSettings.enabled}>
                Save MQTT Settings
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="devices" className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Device Registration</h3>
              <p className="text-sm text-muted-foreground">
                Each of your registered devices has a unique ID that can be used to authenticate with the platform.
                Use these IDs when configuring your physical devices.
              </p>
            </div>
            
            <div className="space-y-4">
              {deviceIds.map(device => (
                <div key={device.id} className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-4 space-y-1">
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="font-mono text-xs">{device.id}</p>
                    </div>
                    <div className="p-4 bg-muted/50 flex items-center justify-center">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          device_id: device.id,
                          name: device.name,
                          api_endpoint: "https://api.farmconnect.io/v1"
                        })}
                        size={100}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/30 p-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      Scan this QR code with your device's setup app
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t flex justify-between pt-4">
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <Button variant="outline" onClick={() => navigate('/devices')}>
          Manage Devices
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeviceConnectivity;
