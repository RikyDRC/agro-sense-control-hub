
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import APIKeySettings from '@/components/device-connectivity/APIKeySettings';
import MQTTSettings from '@/components/device-connectivity/MQTTSettings';
import QRCodeLinking from '@/components/device-connectivity/QRCodeLinking';

const DeviceConnectivity: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation('connectivity');

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
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{t('gettingStarted')}</AlertTitle>
          <AlertDescription>
            {t('gettingStartedDescription')}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="api-keys" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="api-keys">{t('apiKeys')}</TabsTrigger>
            <TabsTrigger value="mqtt">{t('mqtt')}</TabsTrigger>
            <TabsTrigger value="qr-code">{t('qrCode')}</TabsTrigger>
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
