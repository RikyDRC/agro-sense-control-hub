
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { wifi, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MQTTConfig {
  id: string;
  user_id: string;
  mqtt_username: string;
  mqtt_password: string;
  mqtt_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface MQTTSettingsProps {
  userId?: string;
}

const MQTTSettings: React.FC<MQTTSettingsProps> = ({ userId }) => {
  const [mqttConfig, setMqttConfig] = useState<MQTTConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Example broker settings - in a real application, these might be specific to each user or environment
  const brokerSettings = {
    host: "mqtt.farm-iot-dashboard.com",
    port: 1883,
    wsPort: 8083,
    tlsPort: 8883
  };

  useEffect(() => {
    if (userId) {
      loadMQTTConfig();
    }
  }, [userId]);

  const loadMQTTConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mqtt_config')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if no config exists
        throw error;
      }
      
      setMqttConfig(data);
    } catch (error: any) {
      console.error('Error loading MQTT config:', error);
      toast.error('Failed to load MQTT configuration');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCredentials = () => {
    // Generate a random username based on user id and random string
    const username = `user_${userId?.substring(0, 8)}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Generate a random password
    const password = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
                    
    return { username, password };
  };

  const saveOrUpdateConfig = async (enabled: boolean = true) => {
    try {
      setSaving(true);
      
      if (!mqttConfig) {
        // Create new config
        const credentials = generateRandomCredentials();
        const { error } = await supabase
          .from('mqtt_config')
          .insert({
            user_id: userId,
            mqtt_username: credentials.username,
            mqtt_password: credentials.password,
            mqtt_enabled: enabled
          });
          
        if (error) throw error;
        toast.success('MQTT configuration created successfully');
      } else {
        // Update existing config
        const { error } = await supabase
          .from('mqtt_config')
          .update({ mqtt_enabled: enabled })
          .eq('id', mqttConfig.id);
          
        if (error) throw error;
        toast.success('MQTT configuration updated successfully');
      }
      
      loadMQTTConfig();
    } catch (error: any) {
      console.error('Error saving MQTT config:', error);
      toast.error('Failed to save MQTT configuration');
    } finally {
      setSaving(false);
    }
  };

  const regenerateCredentials = async () => {
    if (!mqttConfig) return;
    
    if (!confirm('Are you sure you want to regenerate your MQTT credentials? All connected devices will need to be updated.')) {
      return;
    }
    
    try {
      setSaving(true);
      const credentials = generateRandomCredentials();
      
      const { error } = await supabase
        .from('mqtt_config')
        .update({
          mqtt_username: credentials.username,
          mqtt_password: credentials.password
        })
        .eq('id', mqttConfig.id);
        
      if (error) throw error;
      
      toast.success('MQTT credentials regenerated successfully');
      loadMQTTConfig();
    } catch (error: any) {
      console.error('Error regenerating MQTT credentials:', error);
      toast.error('Failed to regenerate MQTT credentials');
    } finally {
      setSaving(false);
    }
  };

  const toggleMQTT = async (enabled: boolean) => {
    if (mqttConfig) {
      await saveOrUpdateConfig(enabled);
    } else {
      await saveOrUpdateConfig(enabled);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <wifi className="h-5 w-5" />
              <CardTitle>MQTT Connection</CardTitle>
            </div>
            <Switch 
              checked={mqttConfig?.mqtt_enabled || false} 
              onCheckedChange={toggleMQTT}
              disabled={saving}
            />
          </div>
          <CardDescription>
            Connect your devices using MQTT for real-time, bi-directional communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading MQTT configuration...</div>
          ) : mqttConfig ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mqtt-username">MQTT Username</Label>
                  <div className="flex mt-1">
                    <Input 
                      id="mqtt-username" 
                      value={mqttConfig.mqtt_username} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2" 
                      onClick={() => copyToClipboard(mqttConfig.mqtt_username)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="mqtt-password">MQTT Password</Label>
                  <div className="flex mt-1">
                    <Input 
                      id="mqtt-password" 
                      value={mqttConfig.mqtt_password} 
                      readOnly 
                      className="font-mono"
                      type="password"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2" 
                      onClick={() => copyToClipboard(mqttConfig.mqtt_password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Connection Details</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Broker Host</TableCell>
                    <TableCell>{brokerSettings.host}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(brokerSettings.host)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>MQTT Port (TCP)</TableCell>
                    <TableCell>{brokerSettings.port}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(brokerSettings.port.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>WebSocket Port</TableCell>
                    <TableCell>{brokerSettings.wsPort}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(brokerSettings.wsPort.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TLS/SSL Port</TableCell>
                    <TableCell>{brokerSettings.tlsPort}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(brokerSettings.tlsPort.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="flex justify-end">
                <Button onClick={regenerateCredentials} variant="outline" disabled={saving}>
                  Regenerate Credentials
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">MQTT configuration not setup yet. Enable MQTT to get started.</p>
              <Button onClick={() => saveOrUpdateConfig(true)} disabled={saving}>
                Setup MQTT
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2">
          <p className="text-sm font-medium">Topic Structure</p>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Topic Pattern</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Device Data</TableCell>
                  <TableCell><code>farm/{userId?.substring(0, 8)}/devices/+/data</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Device Commands</TableCell>
                  <TableCell><code>farm/{userId?.substring(0, 8)}/devices/+/cmd</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Device Status</TableCell>
                  <TableCell><code>farm/{userId?.substring(0, 8)}/devices/+/status</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MQTT Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Arduino/ESP8266/ESP32 Example</h4>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
{`// Example with PubSubClient library
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* mqtt_server = "${brokerSettings.host}";
const int mqtt_port = ${brokerSettings.port};
const char* mqtt_username = "YOUR_MQTT_USERNAME";
const char* mqtt_password = "YOUR_MQTT_PASSWORD";

// Define topics
String userId = "YOUR_USER_ID";
String deviceId = "sensor-01";
String dataTopic = "farm/" + userId + "/devices/" + deviceId + "/data";
String cmdTopic = "farm/" + userId + "/devices/" + deviceId + "/cmd";
String statusTopic = "farm/" + userId + "/devices/" + deviceId + "/status";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_mqtt() {
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP8266Client", mqtt_username, mqtt_password)) {
      client.subscribe(cmdTopic.c_str());
      client.publish(statusTopic.c_str(), "online", true);
    } else {
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Handle incoming messages on subscribed topics
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  // Process the command
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publish sensor data every 30 seconds
  client.publish(dataTopic.c_str(), "{\\"sensor\\":\\"moisture\\",\\"value\\":45}");
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MQTTSettings;
