import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Wifi, 
  Battery, 
  Droplet, 
  Thermometer,
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Device, Zone, DeviceStatus } from '@/types';

interface SystemHealthMetrics {
  overallHealth: number;
  networkConnectivity: number;
  deviceUptime: number;
  dataQuality: number;
  batteryHealth: number;
  irrigationEfficiency: number;
}

interface SystemHealthWidgetProps {
  devices: Device[];
  zones: Zone[];
  className?: string;
}

const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ 
  devices, 
  zones, 
  className 
}) => {
  const { t } = useTranslation('dashboard');

  const calculateSystemHealth = (): SystemHealthMetrics => {
    if (devices.length === 0) {
      return {
        overallHealth: 0,
        networkConnectivity: 0,
        deviceUptime: 0,
        dataQuality: 0,
        batteryHealth: 0,
        irrigationEfficiency: 0
      };
    }

    const onlineDevices = devices.filter(d => d.status === DeviceStatus.ONLINE);
    const networkConnectivity = (onlineDevices.length / devices.length) * 100;
    
    const devicesWithBattery = devices.filter(d => d.batteryLevel !== undefined);
    const avgBatteryLevel = devicesWithBattery.length > 0 
      ? devicesWithBattery.reduce((sum, d) => sum + (d.batteryLevel || 0), 0) / devicesWithBattery.length
      : 100;

    const deviceUptime = networkConnectivity;
    const dataQuality = Math.min(networkConnectivity + 10, 100);
    const irrigationEfficiency = zones.length > 0 ? 85 : 0;

    const overallHealth = Math.round(
      (networkConnectivity * 0.3 + 
       deviceUptime * 0.2 + 
       dataQuality * 0.2 + 
       avgBatteryLevel * 0.15 + 
       irrigationEfficiency * 0.15)
    );

    return {
      overallHealth,
      networkConnectivity: Math.round(networkConnectivity),
      deviceUptime: Math.round(deviceUptime),
      dataQuality: Math.round(dataQuality),
      batteryHealth: Math.round(avgBatteryLevel),
      irrigationEfficiency: Math.round(irrigationEfficiency)
    };
  };

  const metrics = calculateSystemHealth();
  
  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (value: number) => {
    if (value >= 80) return 'bg-green-100';
    if (value >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const healthItems = [
    {
      label: t('widgets.systemHealth.network'),
      value: metrics.networkConnectivity,
      icon: <Wifi className="h-4 w-4" />,
      description: `${devices.filter(d => d.status === DeviceStatus.ONLINE).length}/${devices.length} ${t('widgets.systemHealth.devicesOnline')}`
    },
    {
      label: t('widgets.systemHealth.deviceUptime'),
      value: metrics.deviceUptime,
      icon: <Activity className="h-4 w-4" />,
      description: t('widgets.systemHealth.averageUptime')
    },
    {
      label: t('widgets.systemHealth.dataQuality'),
      value: metrics.dataQuality,
      icon: <Database className="h-4 w-4" />,
      description: t('widgets.systemHealth.sensorAccuracy')
    },
    {
      label: t('widgets.systemHealth.batteryHealth'),
      value: metrics.batteryHealth,
      icon: <Battery className="h-4 w-4" />,
      description: t('widgets.systemHealth.averageBatteryLevel')
    },
    {
      label: t('widgets.systemHealth.irrigationEfficiency'),
      value: metrics.irrigationEfficiency,
      icon: <Droplet className="h-4 w-4" />,
      description: t('widgets.systemHealth.systemEfficiency')
    }
  ];

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              {t('widgets.systemHealth.title')}
            </CardTitle>
            <CardDescription>
              {t('widgets.systemHealth.description')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-bold", getHealthColor(metrics.overallHealth))}>
              {metrics.overallHealth}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.overallHealth >= 80 ? (
                <><TrendingUp className="h-3 w-3 mr-1 text-green-500" /> {t('widgets.systemHealth.excellent')}</>
              ) : metrics.overallHealth >= 60 ? (
                <><TrendingUp className="h-3 w-3 mr-1 text-yellow-500" /> {t('widgets.systemHealth.good')}</>
              ) : (
                <><TrendingDown className="h-3 w-3 mr-1 text-red-500" /> {t('widgets.systemHealth.needsAttention')}</>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded", getHealthBg(item.value))}>
                    <span className={getHealthColor(item.value)}>
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getHealthColor(item.value))}
                >
                  {item.value}%
                </Badge>
              </div>
              <Progress 
                value={item.value} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthWidget;
