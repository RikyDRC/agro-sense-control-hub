import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Activity, 
  Bell, 
  BarChart3, 
  Settings,
  TrendingUp,
  Droplet,
  Thermometer,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  activeDevices: number;
  totalAlerts: number;
  systemHealth: number;
  waterUsage: string;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  children,
  activeDevices,
  totalAlerts,
  systemHealth,
  waterUsage
}) => {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  const quickStats = [
    {
      icon: <Wifi className="h-4 w-4" />,
      label: t('mobileDashboard.devices'),
      value: activeDevices.toString(),
      color: 'text-blue-600'
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: t('mobileDashboard.alerts'),
      value: totalAlerts.toString(),
      color: totalAlerts > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: t('mobileDashboard.health'),
      value: `${systemHealth}%`,
      color: systemHealth > 80 ? 'text-green-600' : systemHealth > 60 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      icon: <Droplet className="h-4 w-4" />,
      label: t('mobileDashboard.water'),
      value: waterUsage,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4">
        <div className="grid grid-cols-4 gap-2 p-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={cn("flex items-center justify-center mb-1", stat.color)}>
                {stat.icon}
              </div>
              <div className="text-xs font-medium">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-3">
          {children}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-transparent">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">{t('mobileDashboard.overview')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">{t('mobileDashboard.charts')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <Bell className="h-4 w-4" />
              <span className="text-xs">{t('mobileDashboard.alerts')}</span>
              {totalAlerts > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 p-0 text-xs">
                  {totalAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <Activity className="h-4 w-4" />
              <span className="text-xs">{t('mobileDashboard.activity')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">{t('mobileDashboard.insights')}</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileDashboardLayout;
