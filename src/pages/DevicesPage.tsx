import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, FlaskConical, Plus, Pencil, Trash2, Check, X 
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { 
  Device, DeviceStatus, DeviceType, Zone, IrrigationStatus
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import DeviceCard from '@/components/DeviceCard';

const initialDevices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 78,
    lastReading: 32.5,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Temperature Sensor A2',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 92,
    lastReading: 24.3,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '3',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.OFFLINE,
    batteryLevel: 15,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-b'
  },
  {
    id: '4',
    name: 'Main Pump',
    type: DeviceType.PUMP,
    status: DeviceStatus.ONLINE,
    batteryLevel: 65,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '5',
    name: 'Weather Station',
    type: DeviceType.WEATHER_STATION,
    status: DeviceStatus.MAINTENANCE,
    batteryLevel: 42,
    lastUpdated: new Date(Date.now() - 43200000).toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  }
];

const initialZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'North field with corn',
    boundaryCoordinates: [],
    areaSize: 1000,
    devices: ['1', '2'],
    irrigationStatus: IrrigationStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'East field with soybeans',
    boundaryCoordinates: [],
    areaSize: 1200,
    devices: ['3'],
    irrigationStatus: IrrigationStatus.INACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface DeviceFormValues {
  id?: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel: number;
  location: { lat: number; lng: number };
  zoneId?: string;
}

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [activeTab, setActiveTab] = useState('all');
  const [formValues, setFormValues] = useState<DeviceFormValues>({
    name: '',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 100,
    location: { lat: 0, lng: 0 }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const filteredDevices = activeTab === 'all' 
    ? devices 
    : devices.filter(device => device.type === activeTab);

  const handleCreateDevice = () => {
    const newDevice: Device = {
      id: uuidv4(),
      name: formValues.name,
      type: formValues.type,
      status: formValues.status,
      batteryLevel: formValues.batteryLevel,
      location: formValues.location,
      zoneId: formValues.zoneId,
      lastUpdated: new Date().toISOString()
    };

    setDevices(prev => [...prev, newDevice]);
    resetForm();
    setIsDialogOpen(false);
    toast.success("Device added successfully");
  };

  const handleUpdateDevice = () => {
    if (!formValues.id) return;

    setDevices(prev => 
      prev.map(device => 
        device.id === formValues.id 
          ? {
              ...device,
              name: formValues.name,
              type: formValues.type,
              status: formValues.status,
              batteryLevel: formValues.batteryLevel,
              zoneId: formValues.zoneId,
              updatedAt: new Date().toISOString()
            } 
          : device
      )
    );

    resetForm();
    setIsDialogOpen(false);
    setIsEditing(false);
    toast.success("Device updated successfully");
  };

  const handleEditDevice = (device: Device) => {
    setFormValues({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      batteryLevel: device.batteryLevel,
      location: device.location,
      zoneId: device.zoneId
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deviceToDelete) return;
    
    setDevices(prev => prev.filter(device => device.id !== deviceToDelete));
    setDeviceToDelete(null);
    setIsDeleteDialogOpen(false);
    toast.success("Device deleted successfully");
  };

  const handleStatusChange = (deviceId: string, status: DeviceStatus) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, status, lastUpdated: new Date().toISOString() } 
          : device
      )
    );
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      type: DeviceType.MOISTURE_SENSOR,
      status: DeviceStatus.ONLINE,
      batteryLevel: 100,
      location: { lat: 0, lng: 0 }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
            <p className="text-muted-foreground">Manage your field sensors and irrigation equipment</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-md overflow-hidden border">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
            </div>
            <Button onClick={() => {
              resetForm();
              setIsEditing(false);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Device
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Devices</TabsTrigger>
            <TabsTrigger value={DeviceType.MOISTURE_SENSOR}>Moisture Sensors</TabsTrigger>
            <TabsTrigger value={DeviceType.TEMPERATURE_SENSOR}>Temperature Sensors</TabsTrigger>
            <TabsTrigger value={DeviceType.VALVE}>Valves</TabsTrigger>
            <TabsTrigger value={DeviceType.PUMP}>Pumps</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredDevices.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <p className="text-muted-foreground mb-4">No devices found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsEditing(false);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Device
                  </Button>
                </CardContent>
              </Card>
            ) : viewMode === 'cards' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDevices.map((device) => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Battery</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            <p className="text-muted-foreground">No devices found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDevices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                  {getDeviceIcon(device.type)}
                                </div>
                                <span>{device.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {device.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {device.zoneId 
                                ? zones.find(zone => zone.id === device.zoneId)?.name || 'Unknown Zone'
                                : 'Unassigned'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(device.status)} text-white`}>
                                {getStatusText(device.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Battery className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className={
                                  device.batteryLevel < 20 ? "text-red-500" : 
                                  device.batteryLevel < 50 ? "text-amber-500" : "text-green-500"
                                }>
                                  {device.batteryLevel}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(device.lastUpdated).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleEditDevice(device)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="text-red-500"
                                  onClick={() => {
                                    setDeviceToDelete(device.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Device' : 'Add New Device'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the device information' 
                : 'Fill out the form to add a new device to your farm'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(e) => setFormValues({...formValues, name: e.target.value})}
                className="col-span-3"
                placeholder="Moisture Sensor A1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={formValues.type} 
                onValueChange={(value) => setFormValues({...formValues, type: value as DeviceType})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formValues.status} 
                onValueChange={(value) => setFormValues({...formValues, status: value as DeviceStatus})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batteryLevel" className="text-right">
                Battery Level
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="batteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formValues.batteryLevel}
                  onChange={(e) => setFormValues({
                    ...formValues, 
                    batteryLevel: parseInt(e.target.value) || 0
                  })}
                  className="w-20 mr-2"
                />
                <span>%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone" className="text-right">
                Zone
              </Label>
              <Select 
                value={formValues.zoneId || 'unassigned'}
                onValueChange={(value) => setFormValues({...formValues, zoneId: value === 'unassigned' ? undefined : value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Assign to zone (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={isEditing ? handleUpdateDevice : handleCreateDevice}>
              {isEditing ? 'Update Device' : 'Add Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Check className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DevicesPage;
