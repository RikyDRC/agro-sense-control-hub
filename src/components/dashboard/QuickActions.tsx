
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Droplet, 
  Power, 
  Eye, 
  Shield, 
  Bell, 
  MapPin, 
  Clock,
  Play,
  Pause,
  X,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useZones } from '@/hooks/useZones';
import { useDevices } from '@/hooks/useDevices';
import { Device, Zone, DeviceStatus, IrrigationStatus } from '@/types';

const QuickActions: React.FC = () => {
  const { data: zones = [] } = useZones();
  const { data: devices = [] } = useDevices();

  const handleAction = (action: string) => {
    toast.success(`${action} command sent successfully`);
  };

  // Calculate system status based on real data
  const getSystemStatus = () => {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status === DeviceStatus.ONLINE).length;
    const offlineDevices = devices.filter(d => d.status === DeviceStatus.OFFLINE).length;
    const alertDevices = devices.filter(d => d.status === DeviceStatus.ALERT).length;
    const maintenanceDevices = devices.filter(d => d.status === DeviceStatus.MAINTENANCE).length;

    const waterSupplyStatus = devices.some(d => d.type === 'pump' && d.status === DeviceStatus.ONLINE) ? 'Normal' : 'Check Required';
    const powerStatus = onlineDevices > 0 ? 'Online' : 'Offline';
    const sensorStatus = devices.some(d => d.type.includes('sensor') && d.status === DeviceStatus.ONLINE) ? 'Active' : 'Inactive';
    const securityStatus = alertDevices === 0 ? 'Secure' : 'Alert';
    const alertsCount = alertDevices + maintenanceDevices;

    return {
      waterSupply: { status: waterSupplyStatus, color: waterSupplyStatus === 'Normal' ? 'green' : 'yellow' },
      power: { status: powerStatus, color: powerStatus === 'Online' ? 'green' : 'red' },
      sensor: { status: sensorStatus, color: sensorStatus === 'Active' ? 'green' : 'yellow' },
      security: { status: securityStatus, color: securityStatus === 'Secure' ? 'green' : 'red' },
      alerts: { count: alertsCount, color: alertsCount === 0 ? 'green' : alertsCount < 3 ? 'yellow' : 'red' }
    };
  };

  const systemStatus = getSystemStatus();
  const activeZones = zones.filter(zone => zone.irrigationStatus === IrrigationStatus.ACTIVE);
  const inactiveZones = zones.filter(zone => zone.irrigationStatus === IrrigationStatus.INACTIVE);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Zap className="h-5 w-5 mr-2 text-agro-green" /> Quick Actions
        </CardTitle>
        <CardDescription>
          Control your irrigation system and monitor status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Irrigation Control</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Start All Irrigation')}
                disabled={devices.length === 0}
              >
                <Play className="h-4 w-4 mr-2 text-green-500" /> 
                Start All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Pause All Irrigation')}
                disabled={activeZones.length === 0}
              >
                <Pause className="h-4 w-4 mr-2 text-amber-500" /> 
                Pause All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Emergency Stop')}
              >
                <X className="h-4 w-4 mr-2 text-red-500" /> 
                Emergency Stop
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Schedule Check')}
              >
                <Clock className="h-4 w-4 mr-2 text-blue-500" /> 
                Check Schedule
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Zone Control ({zones.length} zones)</h3>
            {zones.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No zones configured</p>
                <Button variant="link" size="sm" className="mt-1">
                  Create your first zone
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {zones.slice(0, 4).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm truncate">{zone.name}</span>
                      <Badge 
                        variant={zone.irrigationStatus === IrrigationStatus.ACTIVE ? "default" : "secondary"}
                        className="ml-2 text-xs"
                      >
                        {zone.irrigationStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleAction(`Activate ${zone.name}`)}
                        disabled={zone.irrigationStatus === IrrigationStatus.ACTIVE}
                      >
                        <Play className="h-3.5 w-3.5 text-green-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleAction(`Deactivate ${zone.name}`)}
                        disabled={zone.irrigationStatus !== IrrigationStatus.ACTIVE}
                      >
                        <Pause className="h-3.5 w-3.5 text-amber-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {zones.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{zones.length - 4} more zones
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">System Status</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="flex items-center">
                <Droplet className="h-4 w-4 mr-2 text-blue-500" />
                <span>Water Supply</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className={`h-2 w-2 rounded-full bg-${systemStatus.waterSupply.color}-500 mr-1`}></span>
                {systemStatus.waterSupply.status}
              </Badge>
              
              <div className="flex items-center">
                <Power className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Power System</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className={`h-2 w-2 rounded-full bg-${systemStatus.power.color}-500 mr-1`}></span>
                {systemStatus.power.status}
              </Badge>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-purple-500" />
                <span>Sensor Network</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className={`h-2 w-2 rounded-full bg-${systemStatus.sensor.color}-500 mr-1`}></span>
                {systemStatus.sensor.status}
              </Badge>
              
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span>Security</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className={`h-2 w-2 rounded-full bg-${systemStatus.security.color}-500 mr-1`}></span>
                {systemStatus.security.status}
              </Badge>
              
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-red-500" />
                <span>Alerts</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className={`h-2 w-2 rounded-full bg-${systemStatus.alerts.color}-500 mr-1`}></span>
                {systemStatus.alerts.count === 0 ? 'None' : systemStatus.alerts.count}
              </Badge>
            </div>
          </div>

          {devices.length === 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">No devices configured</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add devices to start monitoring your farm
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
