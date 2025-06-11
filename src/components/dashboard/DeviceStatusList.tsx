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
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeviceStatusListProps {
  devices: Device[];
  className?: string;
}

const getDeviceIcon = (type: DeviceType) => {
  switch (type) {
    case DeviceType.MOISTURE_SENSOR:
      return <Droplet className="h-4 w-4" />;
    case DeviceType.TEMPERATURE_SENSOR:
      return <Thermometer className="h-4 w-4" />;
    case DeviceType.VALVE:
      return <Activity className="h-4 w-4" />;
    case DeviceType.PUMP:
      return <Zap className="h-4 w-4" />;
    case DeviceType.WEATHER_STATION:
      return <Eye className="h-4 w-4" />;
    case DeviceType.PH_SENSOR:
      return <FlaskConical className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getStatusColor = (status: DeviceStatus) => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return "bg-agro-status-success";
    case DeviceStatus.OFFLINE:
      return "bg-slate-400";
    case DeviceStatus.MAINTENANCE:
      return "bg-agro-status-warning";
    case DeviceStatus.ALERT:
      return "bg-agro-status-danger";
    default:
      return "bg-slate-400";
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

const DeviceStatusList: React.FC<DeviceStatusListProps> = ({ devices, className }) => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={cn("h-full shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('widgets.deviceStatus.title')}</CardTitle>
            <CardDescription>{t('widgets.deviceStatus.statusAndBattery')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">{t('widgets.deviceStatus.refresh')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {devices.map((device) => (
            <div 
              key={device.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  device.status === DeviceStatus.ONLINE ? "bg-green-100 group-hover:bg-green-200" : 
                  device.status === DeviceStatus.ALERT ? "bg-red-100 group-hover:bg-red-200" :
                  device.status === DeviceStatus.MAINTENANCE ? "bg-amber-100 group-hover:bg-amber-200" :
                  "bg-gray-100 group-hover:bg-gray-200"
                )}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{device.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {device.lastReading !== undefined ? 
                      `${t('widgets.deviceStatus.lastReading')}: ${device.lastReading}` : 
                      `${t('widgets.deviceStatus.lastUpdated')}: ${new Date(device.lastUpdated).toLocaleString()}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center">
                    <Battery className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className={cn(
                      "text-xs font-medium",
                      getBatteryColorClass(device.batteryLevel)
                    )}>
                      {device.batteryLevel}%
                    </span>
                  </div>
                )}
                <Badge className={cn(
                  "text-white",
                  getStatusColor(device.status)
                )}>
                  {getStatusText(device.status, t)}
                </Badge>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('widgets.deviceStatus.noDevicesFound')}</p>
              <Button variant="outline" size="sm" className="mt-2">
                {t('widgets.deviceStatus.addDevice')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusList;
