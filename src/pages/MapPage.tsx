import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MapView from '@/components/map/MapView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, RotateCw } from 'lucide-react';
import { Device, DeviceStatus, DeviceType, Zone, GeoLocation, IrrigationStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const MapPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Check for state passed from ZonesPage
  const routeState = location.state as {
    action?: string;
    zoneId?: string;
    zoneName?: string;
    zoneDescription?: string;
    soilMoistureThreshold?: number;
    soilType?: string;
    cropType?: string;
    irrigationMethod?: string;
    notes?: string;
  } | null;

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
        soilType: zone.soil_type,
        cropType: zone.crop_type,
        irrigationMethod: zone.irrigation_method,
        notes: zone.notes,
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
      toast.error('Failed to load map data: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeviceAdd = async (newDevice: Device) => {
    if (!user) {
      toast.error("You must be logged in to add a device");
      return;
    }

    try {
      // Format for database
      const deviceData = {
        id: newDevice.id,
        name: newDevice.name,
        type: newDevice.type.toString(), // Convert enum to string for database
        status: newDevice.status.toString(), // Convert enum to string for database
        battery_level: newDevice.batteryLevel,
        last_reading: newDevice.lastReading,
        last_updated: newDevice.lastUpdated,
        location: newDevice.location as any, // Type assertion for Json compatibility
        zone_id: newDevice.zoneId,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('devices')
        .insert(deviceData);
      
      if (error) throw error;
      
      // Add to local state
      setDevices(prev => [...prev, newDevice]);
      toast.success('Device added successfully');
    } catch (error: any) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device: ' + error.message);
    }
  };

  const handleZoneAdd = async (newZone: Zone) => {
    if (!user) {
      toast.error("You must be logged in to add a zone");
      return;
    }

    try {
      // Get additional data from route state if available
      const soilType = routeState?.soilType || newZone.soilType;
      const cropType = routeState?.cropType || newZone.cropType;
      const irrigationMethod = routeState?.irrigationMethod || newZone.irrigationMethod;
      const notes = routeState?.notes || newZone.notes;
      
      // Format for database
      const zoneData = {
        id: newZone.id,
        name: newZone.name,
        description: newZone.description || '',
        boundary_coordinates: newZone.boundaryCoordinates as any, // Type assertion for Json compatibility
        area_size: newZone.areaSize,
        irrigation_status: newZone.irrigationStatus.toString(), // Convert enum to string for database
        soil_moisture_threshold: newZone.soilMoistureThreshold,
        soil_type: soilType,
        crop_type: cropType, 
        irrigation_method: irrigationMethod,
        notes: notes,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('zones')
        .insert(zoneData);
      
      if (error) throw error;
      
      // Add to local state
      setZones(prev => [...prev, {
        ...newZone,
        soilType,
        cropType,
        irrigationMethod,
        notes
      }]);
      toast.success('Zone added successfully');
    } catch (error: any) {
      console.error('Error adding zone:', error);
      toast.error('Failed to add zone: ' + error.message);
    }
  };

  const handleDeviceMove = async (deviceId: string, newLocation: GeoLocation) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('devices')
        .update({ location: newLocation as any })
        .eq('id', deviceId);
      
      if (error) throw error;
      
      // Update local state
      setDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, location: newLocation } 
            : device
        )
      );
    } catch (error: any) {
      console.error('Error moving device:', error);
      toast.error('Failed to update device location: ' + error.message);
    }
  };

  // If we're in a loading state, show skeletons
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Field Map</h1>
            <p className="text-muted-foreground">Visualize and manage your fields, zones, and devices</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Field Mapping Guide</AlertTitle>
          <AlertDescription>
            Draw zones by selecting the polygon tool, then place devices within zones. 
            Drag existing devices to reposition them.
          </AlertDescription>
        </Alert>

        <MapView
          devices={devices}
          zones={zones}
          onDeviceAdd={handleDeviceAdd}
          onZoneAdd={handleZoneAdd}
          onDeviceMove={handleDeviceMove}
          editZoneId={routeState?.action === 'editZone' ? routeState.zoneId : undefined}
          createZone={routeState?.action === 'createZone' ? {
            name: routeState.zoneName || '',
            description: routeState.zoneDescription,
            soilMoistureThreshold: routeState.soilMoistureThreshold,
            soilType: routeState.soilType,
            cropType: routeState.cropType,
            irrigationMethod: routeState.irrigationMethod,
            notes: routeState.notes
          } : undefined}
        />
      </div>
    </DashboardLayout>
  );
};

export default MapPage;
