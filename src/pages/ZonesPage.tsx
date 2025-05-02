import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Pencil, Trash2, Check, X, Layers, MapPin, 
  Droplet, ThermometerIcon, PlayCircle, PauseCircle, BarChart3, Map, RotateCw
} from 'lucide-react';
import { Zone, Device, DeviceType, DeviceStatus, IrrigationStatus, GeoLocation } from '@/types';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ZoneFormValues {
  id?: string;
  name: string;
  description: string;
  soilMoistureThreshold?: number;
  soilType?: string;
  cropType?: string;
  irrigationMethod?: string;
  notes?: string;
  boundaryCoordinates?: GeoLocation[];
}

const soilTypes = [
  { value: 'clay', label: 'Clay' },
  { value: 'silt', label: 'Silt' },
  { value: 'sand', label: 'Sandy' },
  { value: 'loam', label: 'Loam' },
  { value: 'peat', label: 'Peat' },
  { value: 'chalk', label: 'Chalky' },
];

const irrigationMethods = [
  { value: 'drip', label: 'Drip Irrigation' },
  { value: 'sprinkler', label: 'Sprinkler System' },
  { value: 'flood', label: 'Flood Irrigation' },
  { value: 'manual', label: 'Manual Watering' },
  { value: 'subsurface', label: 'Subsurface Irrigation' },
];

const getIrrigationStatusBadge = (status: IrrigationStatus) => {
  switch (status) {
    case IrrigationStatus.ACTIVE:
      return (
        <Badge className="bg-green-500 text-white flex items-center gap-1">
          <PlayCircle className="h-3 w-3" /> Active
        </Badge>
      );
    case IrrigationStatus.INACTIVE:
      return (
        <Badge className="bg-slate-400 text-white flex items-center gap-1">
          <PauseCircle className="h-3 w-3" /> Inactive
        </Badge>
      );
    case IrrigationStatus.SCHEDULED:
      return (
        <Badge className="bg-blue-500 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" /> Scheduled
        </Badge>
      );
    case IrrigationStatus.PAUSED:
      return (
        <Badge className="bg-amber-500 text-white flex items-center gap-1">
          <PauseCircle className="h-3 w-3" /> Paused
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-400 text-white">
          Unknown
        </Badge>
      );
  }
};

const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ZonesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize react-hook-form
  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: '',
      description: '',
      soilMoistureThreshold: 30,
      soilType: '',
      cropType: '',
      irrigationMethod: '',
      notes: ''
    }
  });

  // Fetch zones and devices from the database
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
        .select('*');
      
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
      toast.error('Failed to load zones: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateZone = async (values: ZoneFormValues) => {
    try {
      const { name, description, soilMoistureThreshold, soilType, cropType, irrigationMethod, notes } = values;
      
      // Save basic zone info to state for map page
      navigate('/map', { 
        state: { 
          action: 'createZone', 
          zoneName: name,
          zoneDescription: description,
          soilMoistureThreshold,
          soilType,
          cropType,
          irrigationMethod,
          notes
        } 
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating zone:', error);
      toast.error('Failed to create zone: ' + error.message);
    }
  };

  const handleUpdateZone = async (values: ZoneFormValues) => {
    if (!form.getValues().id) return;

    try {
      const zoneId = form.getValues().id;
      const { name, description, soilMoistureThreshold, soilType, cropType, irrigationMethod, notes } = values;
      
      // Update basic zone info
      navigate('/map', { 
        state: { 
          action: 'editZone', 
          zoneId,
          zoneName: name,
          zoneDescription: description,
          soilMoistureThreshold,
          soilType,
          cropType,
          irrigationMethod,
          notes
        } 
      });
      
      setIsDialogOpen(false);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating zone:', error);
      toast.error('Failed to update zone: ' + error.message);
    }
  };

  const handleEditZone = (zone: Zone) => {
    form.reset({
      id: zone.id,
      name: zone.name,
      description: zone.description || '',
      soilMoistureThreshold: zone.soilMoistureThreshold,
      soilType: zone.soilType || undefined,
      cropType: zone.cropType || undefined,
      irrigationMethod: zone.irrigationMethod || undefined,
      notes: zone.notes || undefined
    });
    
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return;
    
    try {
      // Delete zone from database
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneToDelete);
      
      if (error) throw error;
      
      // Update local state
      setZones(prev => prev.filter(zone => zone.id !== zoneToDelete));
      
      // Update devices that were assigned to this zone
      const updatedDevices = devices.map(device => 
        device.zoneId === zoneToDelete 
          ? { ...device, zoneId: undefined } 
          : device
      );
      
      // Update devices in database
      const devicesToUpdate = updatedDevices.filter(device => device.zoneId === undefined);
      
      for (const device of devicesToUpdate) {
        await supabase
          .from('devices')
          .update({ zone_id: null })
          .eq('id', device.id);
      }
      
      setDevices(updatedDevices);
      toast.success("Zone deleted successfully");
    } catch (error: any) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone: ' + error.message);
    } finally {
      setZoneToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      soilMoistureThreshold: 30,
      soilType: '',
      cropType: '',
      irrigationMethod: '',
      notes: ''
    });
  };

  const getDeviceCount = (zoneId: string) => {
    return devices.filter(device => device.zoneId === zoneId).length;
  };

  const getSensorCount = (zoneId: string, type: DeviceType) => {
    return devices.filter(
      device => device.zoneId === zoneId && device.type === type
    ).length;
  };

  const toggleIrrigationStatus = async (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    
    const newStatus = zone.irrigationStatus === IrrigationStatus.ACTIVE 
      ? IrrigationStatus.INACTIVE 
      : IrrigationStatus.ACTIVE;
      
    try {
      // Update in database
      const { error } = await supabase
        .from('zones')
        .update({ 
          irrigation_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', zoneId);
      
      if (error) throw error;
      
      // Update local state
      setZones(prev => 
        prev.map(zone => 
          zone.id === zoneId 
            ? { 
                ...zone, 
                irrigationStatus: newStatus,
                updatedAt: new Date().toISOString()
              } 
            : zone
        )
      );
      
      const action = newStatus === IrrigationStatus.ACTIVE ? 'activated' : 'deactivated';
      toast.success(`Irrigation ${action} for ${zone.name}`);
    } catch (error: any) {
      console.error('Error toggling irrigation status:', error);
      toast.error('Failed to update irrigation status: ' + error.message);
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

          <Card>
            <CardContent className="p-0">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Zones</h1>
            <p className="text-muted-foreground">Manage your field zones and irrigation settings</p>
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
            <Button 
              variant="outline"
              onClick={() => navigate('/map')}
            >
              <Map className="h-4 w-4 mr-2" /> Open Map
            </Button>
            <Button onClick={() => {
              resetForm();
              setIsEditing(false);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Zone
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <p className="text-muted-foreground">No zones found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-primary/10">
                            <Layers className="h-5 w-5" />
                          </div>
                          <span className="font-medium">{zone.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {zone.description || 'No description'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getDeviceCount(zone.id)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Droplet className="h-3 w-3" />
                            {getSensorCount(zone.id, DeviceType.MOISTURE_SENSOR)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ThermometerIcon className="h-3 w-3" />
                            {getSensorCount(zone.id, DeviceType.TEMPERATURE_SENSOR)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{zone.areaSize ? zone.areaSize.toLocaleString() : '0'} m²</span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto"
                          onClick={() => toggleIrrigationStatus(zone.id)}
                        >
                          {getIrrigationStatusBadge(zone.irrigationStatus)}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(zone.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditZone(zone)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => {
                              setZoneToDelete(zone.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                          >
                            <BarChart3 className="h-4 w-4" />
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
      </div>

      {/* Enhanced Zone Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) form.reset();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEditing ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the zone information and settings' 
                : 'Create a new agricultural zone with detailed information'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(isEditing ? handleUpdateZone : handleCreateZone)} className="space-y-6 py-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Field Zone A" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your agricultural zone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the zone's purpose and characteristics" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="soilMoistureThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Moisture Threshold (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Target moisture level for irrigation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soil Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soilTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Crop Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Wheat, Corn, Soybeans" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="irrigationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Irrigation Method</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {irrigationMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional information about this zone" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    After saving, you'll be redirected to the map where you can draw the zone boundaries.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  {isEditing ? 'Update Zone' : 'Create Zone'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this zone? Any devices in this zone will become unassigned.
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

export default ZonesPage;
