
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Device, DeviceType, DeviceStatus, Zone } from '@/types';
import DeviceCard from '@/components/DeviceCard';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { 
  PlusCircle, Search, Settings, Loader2, PlusSquare, Filter, RotateCw 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DevicesPage: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  // Form state for adding/editing devices
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>(DeviceType.MOISTURE_SENSOR);
  const [newDeviceZone, setNewDeviceZone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchZones();
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Transform data to match our types
      const formattedDevices: Device[] = data.map((device: any) => ({
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
      
      setDevices(formattedDevices);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Transform data to match our types
      const formattedZones: Zone[] = data.map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        description: zone.description || '',
        boundaryCoordinates: zone.boundary_coordinates || [],
        areaSize: zone.area_size || 0,
        devices: [],  // We'll populate this below
        irrigationStatus: zone.irrigation_status,
        soilMoistureThreshold: zone.soil_moisture_threshold,
        createdAt: zone.created_at,
        updatedAt: zone.updated_at
      }));
      
      setZones(formattedZones);
    } catch (error: any) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDevices();
  };

  const handleAddDevice = async () => {
    if (!user) return;
    if (!newDeviceName.trim()) {
      toast.error("Device name cannot be empty");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create a new device
      const newDevice = {
        id: uuidv4(),
        name: newDeviceName,
        type: newDeviceType,
        status: 'offline' as DeviceStatus,
        batteryLevel: 100,
        location: { lat: 0, lng: 0 }, // Default location
        zoneId: newDeviceZone || null,
        lastUpdated: new Date().toISOString(),
        user_id: user.id
      };
      
      // Convert to format expected by Supabase
      const deviceData = {
        id: newDevice.id,
        name: newDevice.name,
        type: newDevice.type,
        status: newDevice.status,
        battery_level: newDevice.batteryLevel,
        location: JSON.parse(JSON.stringify(newDevice.location)), // Convert to JSON compatible format
        zone_id: newDevice.zoneId,
        last_updated: newDevice.lastUpdated,
        user_id: newDevice.user_id
      };

      const { error } = await supabase
        .from('devices')
        .insert(deviceData);
      
      if (error) throw error;
      
      // Add to local state
      setDevices(prev => [...prev, {
        ...newDevice,
        lastReading: null,
      }]);

      toast.success('Device added successfully');
      resetForm();
      setShowAddDialog(false);
    } catch (error: any) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDevice = (device: Device) => {
    setCurrentDevice(device);
    setNewDeviceName(device.name);
    setNewDeviceType(device.type);
    setNewDeviceZone(device.zoneId || '');
    setShowEditDialog(true);
  };

  const handleUpdateDevice = async () => {
    if (!user) return;
    if (!currentDevice) return;
    if (!newDeviceName.trim()) {
      toast.error("Device name cannot be empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Update device in database
      const { error } = await supabase
        .from('devices')
        .update({
          name: newDeviceName,
          type: newDeviceType,
          zone_id: newDeviceZone || null,
          last_updated: new Date().toISOString()
        })
        .eq('id', currentDevice.id);

      if (error) throw error;

      // Update local state
      setDevices(prev =>
        prev.map(device =>
          device.id === currentDevice.id
            ? { ...device, name: newDeviceName, type: newDeviceType, zoneId: newDeviceZone || null }
            : device
        )
      );

      toast.success('Device updated successfully');
      resetForm();
      setShowEditDialog(false);
    } catch (error: any) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Delete device from database
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      // Update local state
      setDevices(prev => prev.filter(device => device.id !== deviceId));

      toast.success('Device deleted successfully');
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeviceStatusChange = async (deviceId: string, newStatus: DeviceStatus) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('devices')
        .update({ status: newStatus })
        .eq('id', deviceId);
      
      if (error) throw error;
      
      // Update local state
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, status: newStatus } 
            : device
        )
      );
      
      toast.success(`Device status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating device status:', error);
      toast.error('Failed to update device status');
    }
  };

  const resetForm = () => {
    setNewDeviceName('');
    setNewDeviceType(DeviceType.MOISTURE_SENSOR);
    setNewDeviceZone('');
  };
  
  const getZoneName = (zoneId: string | null): string => {
    const zone = zones.find(zone => zone.id === zoneId);
    return zone ? zone.name : 'N/A';
  };

  const deviceTypes = [
    { value: DeviceType.MOISTURE_SENSOR, label: 'Moisture Sensor' },
    { value: DeviceType.WEATHER_STATION, label: 'Weather Station' },
    { value: DeviceType.VALVE, label: 'Irrigation Controller' },
    { value: DeviceType.CAMERA, label: 'Camera' },
  ];

  const deviceStatuses = [
    { value: DeviceStatus.ONLINE, label: 'Online' },
    { value: DeviceStatus.OFFLINE, label: 'Offline' },
    { value: DeviceStatus.MAINTENANCE, label: 'Maintenance' },
    { value: DeviceStatus.ALERT, label: 'Alert' },
  ];

  const filteredDevices = devices
    .filter(device => device.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(device => filterType === 'all' || device.type === filterType)
    .filter(device => filterStatus === 'all' || device.status === filterStatus);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
            <p className="text-muted-foreground">Manage your connected devices</p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-64"
            />
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </div>
        </div>

        {/* Filtering Options */}
        <div className="flex items-center space-x-4">
          {/* Type Filter */}
          <div>
            <Label htmlFor="type-filter">Type:</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="type-filter" className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter">Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {deviceStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      
        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredDevices.length === 0 ? (
            <div className="col-span-full">
              <Alert>
                <AlertDescription>
                  No devices found matching your criteria
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            filteredDevices.map(device => (
              <DeviceCard 
                key={device.id} 
                device={device}
                onStatusChange={handleDeviceStatusChange}
              />
            ))
          )}
        </div>
      
        {/* Add Device Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Create a new device to connect to your farm.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={newDeviceType} onValueChange={(value) => setNewDeviceType(value as DeviceType)}>
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zone" className="text-right">
                  Zone
                </Label>
                <Select value={newDeviceZone} onValueChange={setNewDeviceZone}>
                  <SelectTrigger id="zone" className="col-span-3">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Zone</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddDevice} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusSquare className="mr-2 h-4 w-4" />
                    Add Device
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Device Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
              <DialogDescription>
                Edit device details and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select value={newDeviceType} onValueChange={(value) => setNewDeviceType(value as DeviceType)}>
                  <SelectTrigger id="edit-type" className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-zone" className="text-right">
                  Zone
                </Label>
                <Select value={newDeviceZone} onValueChange={setNewDeviceZone}>
                  <SelectTrigger id="edit-zone" className="col-span-3">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Zone</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleUpdateDevice} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Update Device
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DevicesPage;
