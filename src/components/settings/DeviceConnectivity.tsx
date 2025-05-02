
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { X, Copy, Check, Plus, Trash, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QRCode } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
}

interface MqttSettings {
  enabled: boolean;
  broker_url: string;
  port: number;
  username: string;
  password: string;
  client_id: string;
}

interface DeviceID {
  id: string;
  device_id: string;
  name: string;
  created_at: string;
}

const DeviceConnectivity: React.FC = () => {
  const { user, profile, isRoleSuperAdmin } = useAuth();
  const navigate = useNavigate();
  
  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  
  // MQTT Settings
  const [mqttSettings, setMqttSettings] = useState<MqttSettings>({
    enabled: false,
    broker_url: '',
    port: 1883,
    username: '',
    password: '',
    client_id: '',
  });
  const [isLoadingMqttSettings, setIsLoadingMqttSettings] = useState(true);
  const [isSavingMqttSettings, setIsSavingMqttSettings] = useState(false);
  
  // Device IDs
  const [deviceIDs, setDeviceIDs] = useState<DeviceID[]>([]);
  const [showNewDeviceIDDialog, setShowNewDeviceIDDialog] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceID, setNewDeviceID] = useState('');
  const [selectedDeviceQR, setSelectedDeviceQR] = useState<DeviceID | null>(null);
  const [isLoadingDeviceIDs, setIsLoadingDeviceIDs] = useState(true);

  // Subscription tier limit simulation
  const [apiKeyLimit, setApiKeyLimit] = useState(5);
  const [deviceIDLimit, setDeviceIDLimit] = useState(10);

  // Simulate fetching API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setApiKeys([
            { 
              id: '1', 
              key: 'sk_test_12345abcdef', 
              name: 'Development API Key', 
              created_at: new Date().toISOString() 
            }
          ]);
          setIsLoadingKeys(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error('Failed to load API keys');
        setIsLoadingKeys(false);
      }
    };

    fetchApiKeys();
  }, [user]);

  // Simulate fetching MQTT settings
  useEffect(() => {
    const fetchMqttSettings = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setMqttSettings({
            enabled: true,
            broker_url: 'mqtt.agrosense.example.com',
            port: 1883,
            username: 'demo_user',
            password: '••••••••',
            client_id: 'agrosense_client_' + Math.random().toString(36).substring(2, 10),
          });
          setIsLoadingMqttSettings(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching MQTT settings:', error);
        toast.error('Failed to load MQTT settings');
        setIsLoadingMqttSettings(false);
      }
    };

    fetchMqttSettings();
  }, [user]);

  // Simulate fetching Device IDs
  useEffect(() => {
    const fetchDeviceIDs = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setDeviceIDs([
            { 
              id: '1', 
              device_id: 'dev_98765xyz', 
              name: 'Greenhouse Sensor', 
              created_at: new Date().toISOString() 
            },
            { 
              id: '2', 
              device_id: 'dev_54321abc', 
              name: 'Field Station 1', 
              created_at: new Date().toISOString() 
            }
          ]);
          setIsLoadingDeviceIDs(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching device IDs:', error);
        toast.error('Failed to load device IDs');
        setIsLoadingDeviceIDs(false);
      }
    };

    fetchDeviceIDs();
  }, [user]);

  // Simulate fetching user's subscription tier information
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      try {
        // Simulate subscription tier based on user role
        if (isRoleSuperAdmin()) {
          setApiKeyLimit(100);
          setDeviceIDLimit(500);
        } else if (profile?.role === 'admin') {
          setApiKeyLimit(25);
          setDeviceIDLimit(100);
        }
      } catch (error) {
        console.error('Error fetching subscription tier:', error);
      }
    };

    fetchSubscriptionTier();
  }, [profile, isRoleSuperAdmin]);

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (apiKeys.length >= apiKeyLimit) {
      toast.error(`You've reached your limit of ${apiKeyLimit} API keys for your current plan`);
      return;
    }

    // Generate a random API key
    const key = 'sk_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    
    const newKey = {
      id: (apiKeys.length + 1).toString(),
      key: key,
      name: newKeyName,
      created_at: new Date().toISOString()
    };

    setApiKeys([...apiKeys, newKey]);
    setNewlyCreatedKey(key);
    setNewKeyName('');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleCloseNewKeyDialog = () => {
    setShowNewKeyDialog(false);
    setNewlyCreatedKey(null);
    setNewKeyName('');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast.success('API key deleted');
  };

  const handleSaveMqttSettings = async () => {
    setIsSavingMqttSettings(true);
    
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('MQTT settings saved successfully');
    } catch (error) {
      console.error('Error saving MQTT settings:', error);
      toast.error('Failed to save MQTT settings');
    } finally {
      setIsSavingMqttSettings(false);
    }
  };

  const handleGenerateDeviceID = async () => {
    if (!newDeviceName.trim()) {
      toast.error('Please enter a name for the device');
      return;
    }

    if (deviceIDs.length >= deviceIDLimit) {
      toast.error(`You've reached your limit of ${deviceIDLimit} device IDs for your current plan`);
      return;
    }

    // Generate a random device ID
    const deviceId = 'dev_' + Math.random().toString(36).substring(2, 10);
    
    const newDevice = {
      id: (deviceIDs.length + 1).toString(),
      device_id: deviceId,
      name: newDeviceName,
      created_at: new Date().toISOString()
    };

    setDeviceIDs([...deviceIDs, newDevice]);
    setNewDeviceName('');
    setNewDeviceID(deviceId);
    setShowNewDeviceIDDialog(false);

    toast.success('Device ID generated successfully');
  };

  const handleDeleteDeviceID = (id: string) => {
    setDeviceIDs(deviceIDs.filter(device => device.id !== id));
    toast.success('Device ID deleted');
  };

  const handleShowQRCode = (device: DeviceID) => {
    setSelectedDeviceQR(device);
  };

  return (
    <>
      {/* API Keys Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for integrating with AgroSense Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingKeys ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {apiKeys.length === 0 ? (
                <Alert>
                  <AlertTitle>No API Keys</AlertTitle>
                  <AlertDescription>
                    You haven't created any API keys yet. Create an API key to integrate with AgroSense Hub.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div>
                        <p className="font-medium">{apiKey.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created on {new Date(apiKey.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => setShowNewKeyDialog(true)}
                  disabled={apiKeys.length >= apiKeyLimit}
                >
                  <Plus className="mr-2 h-4 w-4" /> Generate New API Key
                </Button>
                {apiKeys.length >= apiKeyLimit && (
                  <p className="text-xs text-amber-600 mt-2">
                    You've reached your API key limit ({apiKeyLimit}). 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate('/subscription/plans')}
                    >
                      Upgrade your plan
                    </Button>
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* MQTT Settings Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>MQTT Settings</CardTitle>
          <CardDescription>
            Configure MQTT broker settings for real-time device communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMqttSettings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mqtt-enabled" className="text-base">Enable MQTT</Label>
                <Switch
                  id="mqtt-enabled"
                  checked={mqttSettings.enabled}
                  onCheckedChange={(checked) => 
                    setMqttSettings({...mqttSettings, enabled: checked})
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="broker-url">Broker URL</Label>
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
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveMqttSettings}
            disabled={isSavingMqttSettings || isLoadingMqttSettings}
          >
            {isSavingMqttSettings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Device IDs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Device IDs</CardTitle>
          <CardDescription>
            Manage device identifiers for your smart farm equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDeviceIDs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {deviceIDs.length === 0 ? (
                <Alert>
                  <AlertTitle>No Device IDs</AlertTitle>
                  <AlertDescription>
                    You haven't created any device IDs yet. Generate a device ID to connect your equipment.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {deviceIDs.map((device) => (
                    <div key={device.id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {device.device_id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyKey(device.device_id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleShowQRCode(device)}
                        >
                          QR
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteDeviceID(device.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => setShowNewDeviceIDDialog(true)}
                  disabled={deviceIDs.length >= deviceIDLimit}
                >
                  <Plus className="mr-2 h-4 w-4" /> Generate New Device ID
                </Button>
                {deviceIDs.length >= deviceIDLimit && (
                  <p className="text-xs text-amber-600 mt-2">
                    You've reached your device ID limit ({deviceIDLimit}). 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate('/subscription/plans')}
                    >
                      Upgrade your plan
                    </Button>
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New API Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newlyCreatedKey ? 'API Key Created' : 'Generate New API Key'}
            </DialogTitle>
            <DialogDescription>
              {newlyCreatedKey 
                ? 'Make sure to copy your API key now. You won\'t be able to see it again!' 
                : 'Create a new API key for integrating with AgroSense Hub.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md break-all">
                {newlyCreatedKey}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleCopyKey(newlyCreatedKey)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">API Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreatedKey ? (
              <Button onClick={handleCloseNewKeyDialog}>
                Close
              </Button>
            ) : (
              <div className="flex w-full justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseNewKeyDialog}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateApiKey}>
                  Generate Key
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Device ID Dialog */}
      <Dialog open={showNewDeviceIDDialog} onOpenChange={setShowNewDeviceIDDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Device ID</DialogTitle>
            <DialogDescription>
              Create a new identifier for your smart farm equipment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g., Greenhouse Sensor"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewDeviceIDDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateDeviceID}>
                Generate ID
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device QR Code Dialog */}
      <Dialog open={!!selectedDeviceQR} onOpenChange={(open) => !open && setSelectedDeviceQR(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to connect your device: {selectedDeviceQR?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {selectedDeviceQR && (
              <QRCode 
                value={JSON.stringify({
                  device_id: selectedDeviceQR.device_id,
                  name: selectedDeviceQR.name,
                  timestamp: new Date().toISOString()
                })} 
                size={200}
              />
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setSelectedDeviceQR(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeviceConnectivity;
