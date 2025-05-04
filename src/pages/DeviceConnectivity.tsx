
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const DeviceConnectivity: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Placeholder API Key Settings component
  const APIKeySettings = ({ userId }: { userId?: string }) => {
    const handleGenerateKey = () => {
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created successfully.",
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Generate and manage API keys for your IoT devices to connect to the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKeyName">API Key Name</Label>
            <Input id="apiKeyName" placeholder="Enter a name for your API key" />
          </div>
          <Button onClick={handleGenerateKey}>Generate New API Key</Button>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Your API Keys</h3>
            <p className="text-muted-foreground text-sm">No API keys found. Generate a new key to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Placeholder MQTT Settings component
  const MQTTSettings = ({ userId }: { userId?: string }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MQTT Connection</CardTitle>
          <CardDescription>Configure MQTT settings for real-time device communication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mqttBroker">MQTT Broker</Label>
            <Input id="mqttBroker" defaultValue="mqtt.yourdomain.com" />
          </div>
          <div>
            <Label htmlFor="mqttPort">Port</Label>
            <Input id="mqttPort" defaultValue="1883" />
          </div>
          <div>
            <Label htmlFor="mqttUsername">Username</Label>
            <Input id="mqttUsername" placeholder="MQTT username" />
          </div>
          <div>
            <Label htmlFor="mqttPassword">Password</Label>
            <Input id="mqttPassword" type="password" placeholder="MQTT password" />
          </div>
          <Button>Save MQTT Settings</Button>
        </CardContent>
      </Card>
    );
  };

  // Placeholder QR Code Linking component
  const QRCodeLinking = ({ userId }: { userId?: string }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QR Code Device Linking</CardTitle>
          <CardDescription>Quick and easy device pairing using QR codes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 h-64 flex items-center justify-center border border-gray-200 rounded-md">
            <p className="text-muted-foreground">QR Code will appear here</p>
          </div>
          <Button>Generate QR Code</Button>
          <div>
            <p className="text-sm text-muted-foreground mt-4">Scan this QR code with your IoT device's mobile app to link it to your dashboard.</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Connectivity</h1>
          <p className="text-muted-foreground">Configure how your IoT devices connect to the dashboard</p>
        </div>

        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Getting Started</AlertTitle>
          <AlertDescription>
            Choose a connectivity method that suits your devices. You can use API Keys for REST API integration, MQTT for real-time communication, or QR Codes for quick device linking.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="api-keys" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="mqtt">MQTT</TabsTrigger>
            <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <APIKeySettings userId={user?.id} />
          </TabsContent>

          <TabsContent value="mqtt" className="space-y-4">
            <MQTTSettings userId={user?.id} />
          </TabsContent>

          <TabsContent value="qr-code" className="space-y-4">
            <QRCodeLinking userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DeviceConnectivity;
