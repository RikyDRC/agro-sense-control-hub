
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import APIKeySettings from '@/components/device-connectivity/APIKeySettings';
import MQTTSettings from '@/components/device-connectivity/MQTTSettings';
import QRCodeLinking from '@/components/device-connectivity/QRCodeLinking';
import { Skeleton } from '@/components/ui/skeleton';

const DeviceConnectivity: React.FC = () => {
  const { user, loading } = useAuth();

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
