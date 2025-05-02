
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi, 
  Database, 
  Key, 
  RefreshCcw, 
  QrCode,
  Copy,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const DeviceConnectivity = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // State for API Key management
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  
  // State for MQTT settings
  const [mqttEnabled, setMqttEnabled] = useState(false);
  const [mqttBroker, setMqttBroker] = useState('');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttUsername, setMqttUsername] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');
  const [mqttClientId, setMqttClientId] = useState('');
  const [isSavingMqtt, setIsSavingMqtt] = useState(false);
  
  // State for device ID management
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [isAddingId, setIsAddingId] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  
  // State for QR code
  const [showQrCode, setShowQrCode] = useState(false);
  
  // Subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [deviceLimit, setDeviceLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      // Fetch API Key
      fetchApiKey();
      
      // Fetch MQTT Settings
      fetchMqttSettings();
      
      // Fetch Device IDs
      fetchDeviceIds();
      
      // Fetch subscription status
      fetchSubscriptionStatus();
    }
  }, [user]);
  
  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setApiKey(data.key);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };
  
  const fetchMqttSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('mqtt_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setMqttEnabled(data.enabled);
        setMqttBroker(data.broker_url || '');
        setMqttPort(data.port?.toString() || '1883');
        setMqttUsername(data.username || '');
        setMqttPassword(data.password || '');
        setMqttClientId(data.client_id || '');
      }
    } catch (error) {
      console.error('Error fetching MQTT settings:', error);
    }
  };
  
  const fetchDeviceIds = async () => {
    try {
      const { data, error } = await supabase
        .from('device_ids')
        .select('id')
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      if (data) {
        setDeviceIds(data.map(item => item.id));
      }
    } catch (error) {
      console.error('Error fetching device IDs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscriptionStatus = async () => {
    try {
      if (!user) return;
      
      // Get subscription from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile) {
        setSubscriptionStatus(profile.subscription_tier || 'free');
        
        // Fetch device limits based on subscription tier
        const { data: tierData, error: tierError } = await supabase
          .from('subscription_tiers')
          .select('device_limit')
          .eq('name', profile.subscription_tier || 'free')
          .single();
          
        if (!tierError && tierData) {
          setDeviceLimit(tierData.device_limit);
        } else {
          // Default limits if tier not found
          setDeviceLimit(profile.subscription_tier === 'free' ? 3 : 10);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionStatus('free');
      setDeviceLimit(3); // Default limit
    }
  };
  
  const generateApiKey = async () => {
    try {
      setIsGeneratingKey(true);
      
      // Generate a random API key
      const newApiKey = Array(32)
        .fill(0)
        .map(() => Math.random().toString(36).charAt(2))
        .join('');
        
      // Save to database
      const { error } = await supabase
        .from('api_keys')
        .upsert({ 
          user_id: user?.id, 
          key: newApiKey,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setApiKey(newApiKey);
      setShowApiKey(true);
      toast.success('API key generated successfully');
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key');
    } finally {
      setIsGeneratingKey(false);
    }
  };
  
  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    toast.success('API key copied to clipboard');
    
    // Reset copied state after a delay
    setTimeout(() => {
      setApiKeyCopied(false);
    }, 3000);
  };
  
  const saveMqttSettings = async () => {
    try {
      setIsSavingMqtt(true);
      
      const { error } = await supabase
        .from('mqtt_settings')
        .upsert({
          user_id: user?.id,
          enabled: mqttEnabled,
          broker_url: mqttBroker,
          port: parseInt(mqttPort),
          username: mqttUsername,
          password: mqttPassword,
          client_id: mqttClientId,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('MQTT settings saved successfully');
    } catch (error) {
      console.error('Error saving MQTT settings:', error);
      toast.error('Failed to save MQTT settings');
    } finally {
      setIsSavingMqtt(false);
    }
  };
  
  const generateDeviceId = () => {
    setIsGeneratingId(true);
    
    // Generate a random device ID
    const newId = `device_${Math.random().toString(36).substring(2, 10)}`;
    setNewDeviceId(newId);
    
    setIsGeneratingId(false);
  };
  
  const addDeviceId = async () => {
    try {
      if (!newDeviceId) {
        toast.error('Please generate a device ID first');
        return;
      }
      
      if (deviceIds.length >= deviceLimit) {
        toast.error(`You've reached your device limit (${deviceLimit}). Upgrade your subscription to add more devices.`);
        return;
      }
      
      setIsAddingId(true);
      
      const { error } = await supabase
        .from('device_ids')
        .insert({
          id: newDeviceId,
          user_id: user?.id,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update local state
      setDeviceIds([...deviceIds, newDeviceId]);
      setNewDeviceId('');
      toast.success('Device ID added successfully');
    } catch (error) {
      console.error('Error adding device ID:', error);
      toast.error('Failed to add device ID');
    } finally {
      setIsAddingId(false);
    }
  };
  
  const removeDeviceId = async (id: string) => {
    try {
      const { error } = await supabase
        .from('device_ids')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Update local state
      setDeviceIds(deviceIds.filter(deviceId => deviceId !== id));
      toast.success('Device ID removed successfully');
    } catch (error) {
      console.error('Error removing device ID:', error);
      toast.error('Failed to remove device ID');
    }
  };
  
  const generateQrCode = (id: string) => {
    setSelectedDeviceId(id);
    setShowQrCode(true);
  };
  
  const upgradeSubscription = () => {
    navigate('/subscription/plans');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Device Connectivity</CardTitle>
        <CardDescription>
          Configure settings for connecting devices to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="api-keys">
          <TabsList className="mb-4">
            <TabsTrigger value="api-keys">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="mqtt">
              <Wifi className="h-4 w-4 mr-2" />
              MQTT
            </TabsTrigger>
            <TabsTrigger value="device-ids">
              <Database className="h-4 w-4 mr-2" />
              Device IDs
            </TabsTrigger>
          </TabsList>
          
          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">API Key</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateApiKey}
                  disabled={isGeneratingKey}
                >
                  {isGeneratingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Generate New Key
                    </>
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Use this API key to authenticate requests to our API
              </p>
              
              <div className="flex items-center space-x-2">
                <Input 
                  type={showApiKey ? "text" : "password"} 
                  value={apiKey || 'No API key generated yet'} 
                  readOnly
                  className="font-mono"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? "Hide API Key" : "Show API Key"}
                >
                  {showApiKey ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyApiKey}
                  disabled={!apiKey}
                  title="Copy to Clipboard"
                >
                  {apiKeyCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* MQTT Tab */}
          <TabsContent value="mqtt" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="mqtt-enabled" 
                checked={mqttEnabled} 
                onCheckedChange={setMqttEnabled} 
              />
              <Label htmlFor="mqtt-enabled" className="font-semibold">
                Enable MQTT Integration
              </Label>
            </div>
            
            <div className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mqtt-broker">Broker URL</Label>
                  <Input
                    id="mqtt-broker"
                    placeholder="e.g., mqtt.example.com"
                    value={mqttBroker}
                    onChange={(e) => setMqttBroker(e.target.value)}
                    disabled={!mqttEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mqtt-port">Port</Label>
                  <Input
                    id="mqtt-port"
                    placeholder="1883"
                    value={mqttPort}
                    onChange={(e) => setMqttPort(e.target.value)}
                    disabled={!mqttEnabled}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mqtt-username">Username</Label>
                  <Input
                    id="mqtt-username"
                    placeholder="MQTT Username"
                    value={mqttUsername}
                    onChange={(e) => setMqttUsername(e.target.value)}
                    disabled={!mqttEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mqtt-password">Password</Label>
                  <Input
                    id="mqtt-password"
                    type="password"
                    placeholder="MQTT Password"
                    value={mqttPassword}
                    onChange={(e) => setMqttPassword(e.target.value)}
                    disabled={!mqttEnabled}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mqtt-client-id">Client ID</Label>
                <Input
                  id="mqtt-client-id"
                  placeholder="e.g., agrosense-client-123"
                  value={mqttClientId}
                  onChange={(e) => setMqttClientId(e.target.value)}
                  disabled={!mqttEnabled}
                />
              </div>
              
              <Button 
                onClick={saveMqttSettings} 
                disabled={isSavingMqtt || !mqttEnabled}
              >
                {isSavingMqtt ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save MQTT Settings'
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Device IDs Tab */}
          <TabsContent value="device-ids">
            <div className="space-y-4">
              {/* Subscription info */}
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-semibold">Subscription: {subscriptionStatus || 'Free'}</h4>
                <p className="text-sm text-muted-foreground">
                  You can add up to {deviceLimit} devices with your current plan. 
                  Currently using {deviceIds.length} / {deviceLimit} devices.
                </p>
                {deviceIds.length >= deviceLimit && subscriptionStatus === 'free' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={upgradeSubscription}
                  >
                    Upgrade Subscription
                  </Button>
                )}
              </div>
              
              {/* Generate device ID */}
              <div className="space-y-2">
                <h3 className="font-semibold">Add New Device</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Generate a device ID"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateDeviceId}
                    disabled={isGeneratingId}
                  >
                    {isGeneratingId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </Button>
                  <Button 
                    onClick={addDeviceId}
                    disabled={isAddingId || !newDeviceId || deviceIds.length >= deviceLimit}
                  >
                    {isAddingId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Device IDs list */}
              <div className="space-y-2">
                <h3 className="font-semibold">Your Devices</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : deviceIds.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No device IDs found. Generate one to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deviceIds.map((id) => (
                      <div 
                        key={id} 
                        className="flex justify-between items-center p-2 bg-muted rounded-md"
                      >
                        <span className="font-mono text-sm truncate max-w-[200px]">
                          {id}
                        </span>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => generateQrCode(id)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeDeviceId(id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* QR Code modal */}
                {showQrCode && selectedDeviceId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
                      <h3 className="text-lg font-semibold mb-4">Device QR Code</h3>
                      <div className="flex justify-center mb-4">
                        <QRCode 
                          value={`agrosense://device/${selectedDeviceId}`}
                          size={200}
                          level="H"
                        />
                      </div>
                      <p className="text-sm text-center mb-4">
                        Scan this QR code with your device to configure it
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setShowQrCode(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Need help with device connectivity? <a href="#" className="underline">Visit our docs</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default DeviceConnectivity;

// We need to add the Eye component import that was missing
import { Eye } from 'lucide-react';
