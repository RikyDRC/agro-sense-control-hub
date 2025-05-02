
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Battery, ArrowUpDown, Droplet, Thermometer, Eye, FlaskConical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Device, DeviceStatus, DeviceType } from '@/types';

export interface DeviceCardProps {
  device: Device;
  onStatusChange: (deviceId: string, status: DeviceStatus) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const getDeviceIcon = () => {
    switch (device.type) {
      case DeviceType.MOISTURE_SENSOR:
        return <Droplet className="h-4 w-4" />;
      case DeviceType.TEMPERATURE_SENSOR:
        return <Thermometer className="h-4 w-4" />;
      case DeviceType.VALVE:
        return <Eye className="h-4 w-4" />;
      case DeviceType.PUMP:
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ONLINE:
        return "bg-green-500";
      case DeviceStatus.OFFLINE:
        return "bg-slate-400";
      case DeviceStatus.MAINTENANCE:
        return "bg-yellow-500";
      case DeviceStatus.ALERT:
        return "bg-red-500";
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              {getDeviceIcon()}
            </div>
            <CardTitle className="text-lg">{device.name}</CardTitle>
          </div>
          <Badge className={`${getStatusColor(device.status)} text-white`}>
            {getStatusText(device.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span>{device.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
          </div>
          
          {device.batteryLevel !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Battery:</span>
              <span className="flex items-center">
                <Battery className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className={
                  device.batteryLevel < 20 ? "text-red-500" : 
                  device.batteryLevel < 50 ? "text-amber-500" : "text-green-500"
                }>
                  {device.batteryLevel}%
                </span>
              </span>
            </div>
          )}
          
          {device.lastReading !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Reading:</span>
              <span>
                {device.lastReading} {device.type === DeviceType.TEMPERATURE_SENSOR ? "°C" : "%"}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date(device.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-1 h-3 w-3" /> Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.values(DeviceStatus).map(status => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => onStatusChange(device.id, status)}
                  disabled={status === device.status}
                >
                  Set to {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="mr-1 h-3 w-3" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceCard;
