
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Device, DeviceStatus, DeviceType } from '@/types';
import { 
  Battery, 
  Droplet, 
  Thermometer, 
  Zap, 
  Activity, 
  Eye, 
  FlaskConical,
  Plus,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeviceStatusListProps {
  devices: Device[];
  className?: string;
}

const getDeviceIcon = (type: DeviceType) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case DeviceType.MOISTURE_SENSOR:
      return <Droplet className={iconClass} />;
    case DeviceType.TEMPERATURE_SENSOR:
      return <Thermometer className={iconClass} />;
    case DeviceType.VALVE:
      return <Activity className={iconClass} />;
    case DeviceType.PUMP:
      return <Zap className={iconClass} />;
    case DeviceType.WEATHER_STATION:
      return <Eye className={iconClass} />;
    case DeviceType.PH_SENSOR:
      return <FlaskConical className={iconClass} />;
    default:
      return <Activity className={iconClass} />;
  }
};

const getStatusColor = (status: DeviceStatus) => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300";
    case DeviceStatus.OFFLINE:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300";
    case DeviceStatus.MAINTENANCE:
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300";
    case DeviceStatus.ALERT:
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300";
  }
};

const getStatusText = (status: DeviceStatus, t: any) => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return t('widgets.deviceStatus.online');
    case DeviceStatus.OFFLINE:
      return t('widgets.deviceStatus.offline');
    case DeviceStatus.MAINTENANCE:
      return t('widgets.deviceStatus.maintenance');
    case DeviceStatus.ALERT:
      return t('widgets.deviceStatus.alert');
    default:
      return "Unknown";
  }
};

const getBatteryColorClass = (level: number) => {
  if (level < 20) return "text-red-500";
  if (level < 50) return "text-amber-500";
  return "text-green-500";
};

const getDeviceStatusIconBg = (status: DeviceStatus) => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return "bg-green-50 dark:bg-green-950 group-hover:bg-green-100 dark:group-hover:bg-green-900";
    case DeviceStatus.ALERT:
      return "bg-red-50 dark:bg-red-950 group-hover:bg-red-100 dark:group-hover:bg-red-900";
    case DeviceStatus.MAINTENANCE:
      return "bg-amber-50 dark:bg-amber-950 group-hover:bg-amber-100 dark:group-hover:bg-amber-900";
    default:
      return "bg-gray-50 dark:bg-gray-950 group-hover:bg-gray-100 dark:group-hover:bg-gray-900";
  }
};

const DeviceStatusList: React.FC<DeviceStatusListProps> = ({ devices, className }) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              {t('widgets.deviceStatus.title')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('widgets.deviceStatus.statusAndBattery')}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {devices.slice(0, 6).map((device) => (
            <div 
              key={device.id} 
              className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:border-border hover:bg-muted/30 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-lg transition-colors flex-shrink-0",
                  getDeviceStatusIconBg(device.status)
                )}>
                  {getDeviceIcon(device.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">{device.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {device.lastReading !== undefined ? 
                      `${t('widgets.deviceStatus.lastReading')}: ${device.lastReading}` : 
                      `${t('widgets.deviceStatus.lastUpdated')}: ${new Date(device.lastUpdated).toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3 text-muted-foreground" />
                    <span className={cn(
                      "text-xs font-medium",
                      getBatteryColorClass(device.batteryLevel)
                    )}>
                      {device.batteryLevel}%
                    </span>
                  </div>
                )}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-medium", getStatusColor(device.status))}
                >
                  {getStatusText(device.status, t)}
                </Badge>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 rounded-full bg-muted/50 mb-3">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{t('widgets.deviceStatus.noDevicesFound')}</p>
              <Button variant="outline" size="sm" className="mt-2 h-8 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                {t('widgets.deviceStatus.addDevice')}
              </Button>
            </div>
          )}
          
          {devices.length > 6 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              View {devices.length - 6} more devices
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusList;
