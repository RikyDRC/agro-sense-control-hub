
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
  activeView: string;
  setActiveView: (view: string) => void;
}

const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  children,
  activeDevices,
  totalAlerts,
  systemHealth,
  waterUsage,
  activeView,
  setActiveView
}) => {
  const { t } = useTranslation('dashboard');
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

      <div className="px-3">
        {children}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="grid w-full grid-cols-4 h-16 bg-transparent p-1">
          <button 
            onClick={() => setActiveView('overview')}
            className={cn(
              "flex flex-col gap-1 h-full px-2 py-2 rounded-lg transition-all items-center justify-center",
              activeView === 'overview' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium leading-none">{t('mobileDashboard.overview')}</span>
          </button>
          <button 
            onClick={() => setActiveView('analytics')}
            className={cn(
              "flex flex-col gap-1 h-full px-2 py-2 rounded-lg transition-all items-center justify-center",
              activeView === 'analytics' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium leading-none">{t('mobileDashboard.charts')}</span>
          </button>
          <button 
            onClick={() => setActiveView('monitoring')}
            className={cn(
              "flex flex-col gap-1 h-full px-2 py-2 rounded-lg transition-all items-center justify-center relative",
              activeView === 'monitoring' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium leading-none">{t('mobileDashboard.alerts')}</span>
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {totalAlerts}
              </Badge>
            )}
          </button>
          <button 
            onClick={() => setActiveView('insights')}
            className={cn(
              "flex flex-col gap-1 h-full px-2 py-2 rounded-lg transition-all items-center justify-center",
              activeView === 'insights' ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <TrendingUp className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium leading-none">{t('mobileDashboard.insights')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardLayout;
