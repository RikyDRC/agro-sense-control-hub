
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpRight, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Device, DeviceStatus, DeviceType, Zone, IrrigationStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import DeviceCard from '@/components/DeviceCard';

const initialDevices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor 1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 95,
    lastReading: 67,
    lastUpdated: new Date().toISOString(),
    location: { lat: 34.0522, lng: -118.2437 },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Temperature Sensor 1',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.OFFLINE,
    batteryLevel: 30,
    lastReading: 22,
    lastUpdated: new Date().toISOString(),
    location: { lat: 34.0522, lng: -118.2437 },
    zoneId: 'zone-a'
  },
  {
    id: '3',
    name: 'Valve 1',
    type: DeviceType.VALVE,
    status: DeviceStatus.MAINTENANCE,
    batteryLevel: 75,
    lastReading: null,
    lastUpdated: new Date().toISOString(),
    location: { lat: 34.0522, lng: -118.2437 },
    zoneId: 'zone-b'
  }
];

const initialZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'Primary field zone',
    boundaryCoordinates: [],
    areaSize: 1200,
    devices: ['1', '2'],
    irrigationStatus: IrrigationStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'Secondary field zone',
    boundaryCoordinates: [],
    areaSize: 900,
    devices: ['3'],
    irrigationStatus: IrrigationStatus.SCHEDULED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<DeviceType>(DeviceType.MOISTURE_SENSOR);
  const [status, setStatus] = useState<DeviceStatus>(DeviceStatus.OFFLINE);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [zoneId, setZoneId] = useState('zone-a');
  const user = { id: 'user-123' }; // Mock user object
  
  const handleStatusChange = (deviceId: string, newStatus: DeviceStatus) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId ? { ...device, status: newStatus } : device
      )
    );
    toast.success(`Device status updated to ${newStatus}`);
  };

  const handleCreateDevice = async (device: Partial<Device>) => {
    setIsLoading(true);
    try {
      if (!user) return;

      const newDevice = {
        id: device.id || uuidv4(),
        name: device.name || '',
        type: device.type || DeviceType.MOISTURE_SENSOR,
        status: device.status || DeviceStatus.OFFLINE,
        batteryLevel: device.batteryLevel || 100,
        location: device.location || { lat: 0, lng: 0 },
        zoneId: device.zoneId || null,
        lastReading: null,
        lastUpdated: new Date().toISOString(),
      };
      
      // Optional: Add simulated data handling instead of Supabase insert
      setDevices(prevDevices => [...prevDevices, newDevice as Device]);
      
      toast.success('Device created successfully!');
    } catch (error) {
      console.error('Error creating device:', error);
      toast.error('Failed to create device');
    } finally {
      setIsLoading(false);
      setCreateDialogOpen(false);
      // Clear form fields
      setName('');
      setType(DeviceType.MOISTURE_SENSOR);
      setStatus(DeviceStatus.OFFLINE);
      setBatteryLevel(100);
      setLocation({ lat: 0, lng: 0 });
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setName(device.name);
    setType(device.type);
    setStatus(device.status);
    setBatteryLevel(device.batteryLevel || 100);
    setLocation(device.location);
    setZoneId(device.zoneId || 'zone-a');
    setEditDialogOpen(true);
  };

  const handleUpdateDevice = async () => {
    setIsSubmitting(true);
    try {
      if (!editingDevice) return;

      const updatedDevice = {
        ...editingDevice,
        name,
        type,
        status,
        batteryLevel,
        location,
        zoneId,
        lastUpdated: new Date().toISOString()
      };
      
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === editingDevice.id ? updatedDevice : device
        )
      );
      
      toast.success('Device updated successfully!');
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device');
    } finally {
      setIsSubmitting(false);
      setEditDialogOpen(false);
      setEditingDevice(null);
    }
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    toast.success('Device deleted successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Devices Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor your connected devices
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registered Devices</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Device
            </Button>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground mb-4">No devices found</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Device
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {devices.map((device) => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onStatusChange={handleStatusChange} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Device Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          {/* This trigger is hidden, the button in the card header is used instead */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Device</DialogTitle>
            <DialogDescription>
              Add a new device to your farm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select onValueChange={(value) => setType(value as DeviceType)} value={type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceType).map((type) => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => setStatus(value as DeviceStatus)} value={status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="battery" className="text-right">
                Battery Level
              </Label>
              <Input
                type="number"
                id="battery"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone" className="text-right">
                Zone
              </Label>
              <Select onValueChange={(value) => setZoneId(value)} value={zoneId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} onClick={() => handleCreateDevice({
              name,
              type,
              status,
              batteryLevel,
              location,
              zoneId
            })}>
              {isLoading ? (
                <>
                  Creating <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Create Device'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Make changes to your device here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select value={type} onValueChange={(value) => setType(value as DeviceType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceType).map((type) => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as DeviceStatus)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-battery" className="text-right">
                Battery Level
              </Label>
              <Input
                type="number"
                id="edit-battery"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-zone" className="text-right">
                Zone
              </Label>
              <Select value={zoneId} onValueChange={(value) => setZoneId(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} onClick={handleUpdateDevice}>
              {isSubmitting ? (
                <>
                  Updating <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Update Device'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DevicesPage;
