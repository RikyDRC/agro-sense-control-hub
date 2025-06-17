
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
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: t('mobileDashboard.alerts'),
      value: totalAlerts.toString(),
      color: totalAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: t('mobileDashboard.health'),
      value: `${systemHealth}%`,
      color: systemHealth > 80 ? 'text-green-600 dark:text-green-400' : systemHealth > 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
    },
    {
      icon: <Droplet className="h-4 w-4" />,
      label: t('mobileDashboard.water'),
      value: waterUsage,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className="pb-20 min-h-screen">
      {/* Enhanced sticky header with better visual hierarchy */}
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-lg supports-[backdrop-filter]:bg-card/80 border-b border-border/50 shadow-sm">
        <div className="grid grid-cols-4 gap-3 p-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center p-2 rounded-lg bg-background/50 border border-border/30">
              <div className={cn("flex items-center justify-center mb-2", stat.color)}>
                {stat.icon}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content area with better spacing */}
      <div className="px-4 py-2">
        {children}
      </div>

      {/* Enhanced bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-lg z-30">
        <div className="safe-area-pb">
          <div className="grid w-full grid-cols-4 h-16 bg-transparent p-2">
            <button 
              onClick={() => setActiveView('overview')}
              className={cn(
                "flex flex-col gap-1 h-full px-3 py-2 rounded-xl transition-all items-center justify-center relative",
                activeView === 'overview' 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-none">{t('mobileDashboard.overview')}</span>
            </button>
            
            <button 
              onClick={() => setActiveView('analytics')}
              className={cn(
                "flex flex-col gap-1 h-full px-3 py-2 rounded-xl transition-all items-center justify-center",
                activeView === 'analytics' 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-none">{t('mobileDashboard.charts')}</span>
            </button>
            
            <button 
              onClick={() => setActiveView('monitoring')}
              className={cn(
                "flex flex-col gap-1 h-full px-3 py-2 rounded-xl transition-all items-center justify-center relative",
                activeView === 'monitoring' 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-none">{t('mobileDashboard.alerts')}</span>
              {totalAlerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                >
                  {totalAlerts > 9 ? '9+' : totalAlerts}
                </Badge>
              )}
            </button>
            
            <button 
              onClick={() => setActiveView('insights')}
              className={cn(
                "flex flex-col gap-1 h-full px-3 py-2 rounded-xl transition-all items-center justify-center",
                activeView === 'insights' 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-none">{t('mobileDashboard.insights')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboardLayout;
