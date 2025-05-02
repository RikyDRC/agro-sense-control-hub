
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Device, DeviceStatus, DeviceType } from '@/types';
import { Battery, Droplet, Thermometer, Zap, Activity, Eye, FlaskConical } from 'lucide-react';

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

const getStatusText = (status: DeviceStatus) => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return "Online";
    case DeviceStatus.OFFLINE:
      return "Offline";
    case DeviceStatus.MAINTENANCE:
      return "Maintenance";
    case DeviceStatus.ALERT:
      return "Alert";
    default:
      return "Unknown";
  }
};

const DeviceStatusList: React.FC<DeviceStatusListProps> = ({ devices, className }) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Device Status</CardTitle>
        <CardDescription>Status and battery levels of your field devices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-md",
                  device.status === DeviceStatus.ONLINE ? "bg-green-100" : "bg-gray-100"
                )}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{device.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(device.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Battery className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className={cn(
                    "text-xs",
                    device.batteryLevel < 20 ? "text-red-500" : 
                    device.batteryLevel < 50 ? "text-amber-500" : "text-green-500"
                  )}>
                    {device.batteryLevel}%
                  </span>
                </div>
                <Badge className={cn(
                  "text-white",
                  getStatusColor(device.status)
                )}>
                  {getStatusText(device.status)}
                </Badge>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No devices found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusList;
