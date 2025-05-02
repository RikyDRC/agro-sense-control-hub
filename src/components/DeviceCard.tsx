
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, 
  Power, 
  Settings, 
  Droplet, 
  Thermometer, 
  Activity,
  Zap,
  Eye,
  FlaskConical,
  Clock
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Device, DeviceStatus, DeviceType } from '@/types';

interface DeviceCardProps {
  device: Device;
  onStatusChange?: (deviceId: string, status: DeviceStatus) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onStatusChange }) => {
  const [configOpen, setConfigOpen] = useState(false);
  const [isControlling, setIsControlling] = useState(false);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case DeviceType.MOISTURE_SENSOR:
        return <Droplet className="h-6 w-6" />;
      case DeviceType.TEMPERATURE_SENSOR:
        return <Thermometer className="h-6 w-6" />;
      case DeviceType.VALVE:
        return <Activity className="h-6 w-6" />;
      case DeviceType.PUMP:
        return <Zap className="h-6 w-6" />;
      case DeviceType.WEATHER_STATION:
        return <Eye className="h-6 w-6" />;
      case DeviceType.PH_SENSOR:
        return <FlaskConical className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
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

  const handleStart = () => {
    setIsControlling(true);
    setTimeout(() => {
      if (onStatusChange) {
        onStatusChange(device.id, DeviceStatus.ONLINE);
      }
      toast.success(`Started ${device.name}`);
      setIsControlling(false);
    }, 1000);
  };

  const handleStop = () => {
    setIsControlling(true);
    setTimeout(() => {
      if (onStatusChange) {
        onStatusChange(device.id, DeviceStatus.OFFLINE);
      }
      toast.success(`Stopped ${device.name}`);
      setIsControlling(false);
    }, 1000);
  };

  const getBatteryColor = () => {
    if (!device.batteryLevel) return "text-gray-500";
    if (device.batteryLevel < 20) return "text-red-500";
    if (device.batteryLevel < 50) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-primary/10 ${device.status === DeviceStatus.ONLINE ? 'text-green-500' : 'text-gray-400'}`}>
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {device.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(device.status)} text-white`}>
            {getStatusText(device.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2 text-sm">
          {device.lastReading !== undefined && device.lastReading !== null && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reading:</span>
              <span className="font-medium">
                {device.type === DeviceType.TEMPERATURE_SENSOR ? 
                  `${device.lastReading}°C` : 
                  device.type === DeviceType.MOISTURE_SENSOR ? 
                  `${device.lastReading}%` : 
                  `${device.lastReading}`
                }
              </span>
            </div>
          )}
          
          {device.batteryLevel !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                <Battery className="mr-1 h-3 w-3" /> Battery:
              </span>
              <span className={`font-medium ${getBatteryColor()}`}>
                {device.batteryLevel}%
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center">
              <Clock className="mr-1 h-3 w-3" /> Last updated:
            </span>
            <span className="text-xs">
              {new Date(device.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleStart}
                disabled={isControlling || device.status === DeviceStatus.ONLINE}
              >
                <Power className="h-4 w-4 mr-1" /> Start
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start device</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleStop}
                disabled={isControlling || device.status === DeviceStatus.OFFLINE}
              >
                <Power className="h-4 w-4 mr-1" /> Stop
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stop device</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-1" /> Configure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {device.name}</DialogTitle>
              <DialogDescription>
                Adjust settings and parameters for this device.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Device configuration options will appear here.
              </p>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={() => {
                toast.success("Configuration saved");
                setConfigOpen(false);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DeviceCard;
