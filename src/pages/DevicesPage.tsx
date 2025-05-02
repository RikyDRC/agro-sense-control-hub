import React, { useState, useEffect } from 'react';
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
  Droplet, 
  Thermometer, 
  Battery, 
  Eye, 
  FlaskConical, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  RotateCw
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { 
  Device, DeviceStatus, DeviceType, Zone, IrrigationStatus
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import DeviceCard from '@/components/DeviceCard';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formValues, setFormValues] = useState<DeviceFormValues>({
    name: '',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 100,
    location: { lat: 35.6895, lng: 139.6917 }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const filteredDevices = activeTab === 'all' 
    ? devices 
    : devices.filter(device => device.type === activeTab);

  // Fetch devices and zones from the database
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      if (zonesError) {
        throw zonesError;
      }
      
      // Fetch devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .order('name');
      
      if (devicesError) {
        throw devicesError;
      }
      
      // Transform data to match our types
      const formattedZones: Zone[] = zonesData.map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        description: zone.description || '',
        boundaryCoordinates: zone.boundary_coordinates || [],
        areaSize: zone.area_size || 0,
        devices: [],  // We'll populate this below
        irrigationStatus: zone.irrigation_status as IrrigationStatus || IrrigationStatus.INACTIVE,
        soilMoistureThreshold: zone.soil_moisture_threshold,
        createdAt: zone.created_at,
        updatedAt: zone.updated_at
      }));
      
      const formattedDevices: Device[] = devicesData.map((device: any) => ({
        id: device.id,
        name: device.name,
        type: device.type as DeviceType,
        status: device.status as DeviceStatus,
        batteryLevel: device.battery_level,
        lastReading: device.last_reading,
        lastUpdated: device.last_updated,
        location: device.location,
        zoneId: device.zone_id
      }));
      
      // Update devices array in each zone
      formattedDevices.forEach(device => {
        if (device.zoneId) {
          const zone = formattedZones.find(z => z.id === device.zoneId);
          if (zone && !zone.devices.includes(device.id)) {
            zone.devices.push(device.id);
          }
        }
      });
      
      setZones(formattedZones);
      setDevices(formattedDevices);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load devices: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateDevice = async () => {
    if (!user) {
      toast.error("You must be logged in to add a device");
      return;
    }

    try {
      const newId = uuidv4();
      const timestamp = new Date().toISOString();

      const newDevice: Device = {
        id: newId,
        name: formValues.name,
        type: formValues.type,
        status: formValues.status,
        batteryLevel: formValues.batteryLevel,
        location: formValues.location,
        zoneId: formValues.zoneId,
        lastUpdated: timestamp
      };

      // Format for database - convert the type to ensure it's compatible with the database schema
      const deviceData = {
        id: newDevice.id,
        name: newDevice.name,
        type: newDevice.type.toString(), // Convert enum to string
        status: newDevice.status.toString(), // Convert enum to string
        battery_level: newDevice.batteryLevel,
        location: newDevice.location as any, // Cast to any to avoid type errors with JSON
        zone_id: newDevice.zoneId,
        last_updated: timestamp,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('devices')
        .insert(deviceData);
      
      if (error) throw error;
      
      // Update local state
      setDevices(prev => [...prev, newDevice]);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Device added successfully");
    } catch (error: any) {
      console.error("Error creating device:", error);
      toast.error('Failed to add device: ' + error.message);
    }
  };

  const handleUpdateDevice = async () => {
    if (!formValues.id || !user) return;

    try {
      const timestamp = new Date().toISOString();

      // Format for database - ensuring types are compatible with the database schema
      const deviceData = {
        name: formValues.name,
        type: formValues.type.toString(), // Convert enum to string
        status: formValues.status.toString(), // Convert enum to string
        battery_level: formValues.batteryLevel,
        zone_id: formValues.zoneId,
        updated_at: timestamp,
        last_updated: timestamp
      };
      
      const { error } = await supabase
        .from('devices')
        .update(deviceData)
        .eq('id', formValues.id);
        
      if (error) throw error;

      // Update local state
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
                lastUpdated: timestamp
              } 
            : device
        )
      );

      resetForm();
      setIsDialogOpen(false);
      setIsEditing(false);
      toast.success("Device updated successfully");
    } catch (error: any) {
      console.error("Error updating device:", error);
      toast.error('Failed to update device: ' + error.message);
    }
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

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete) return;
    
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceToDelete);
      
      if (error) throw error;
      
      setDevices(prev => prev.filter(device => device.id !== deviceToDelete));
      setDeviceToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("Device deleted successfully");
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device: ' + error.message);
    }
  };

  const handleStatusChange = async (deviceId: string, status: DeviceStatus) => {
    try {
      const timestamp = new Date().toISOString();

      const { error } = await supabase
        .from('devices')
        .update({ 
          status: status,
          last_updated: timestamp
        })
        .eq('id', deviceId);
      
      if (error) throw error;
      
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { 
                ...device, 
                status, 
                lastUpdated: timestamp 
              } 
            : device
        )
      );
      
      toast.success(`Device status updated to ${status}`);
    } catch (error: any) {
      console.error('Error updating device status:', error);
      toast.error('Failed to update device status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      type: DeviceType.MOISTURE_SENSOR,
      status: DeviceStatus.ONLINE,
      batteryLevel: 100,
      location: { lat: 35.6895, lng: 139.6917 }
    });
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
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

  // If we're in a loading state, show skeletons
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <Skeleton className="h-10 w-full" /> {/* Tabs */}
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
            <p className="text-muted-foreground">Manage your field sensors and irrigation equipment</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
                    onEdit={() => handleEditDevice(device)}
                    onDelete={() => {
                      setDeviceToDelete(device.id);
                      setIsDeleteDialogOpen(true);
                    }}
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

            {!isEditing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Location
                </Label>
                <div className="col-span-3">
                  <p className="text-sm text-muted-foreground">
                    Default position will be used. You can drag the device on the map to set its exact location later.
                  </p>
                </div>
              </div>
            )}
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
