
import React, { useState } from 'react';
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
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Pencil, Trash2, Check, X, Layers, MapPin, 
  Droplet, ThermometerIcon, PlayCircle, PauseCircle, BarChart3
} from 'lucide-react';
import { Zone, Device, DeviceType, DeviceStatus, IrrigationStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const initialZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'North field with corn',
    boundaryCoordinates: [
      { lat: 35.6885, lng: 139.6907 },
      { lat: 35.6905, lng: 139.6927 },
      { lat: 35.6885, lng: 139.6947 },
      { lat: 35.6865, lng: 139.6927 },
    ],
    areaSize: 1000,
    devices: ['1', '2'],
    irrigationStatus: IrrigationStatus.ACTIVE,
    soilMoistureThreshold: 30,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'East field with soybeans',
    boundaryCoordinates: [
      { lat: 35.6845, lng: 139.6947 },
      { lat: 35.6865, lng: 139.6967 },
      { lat: 35.6845, lng: 139.6987 },
      { lat: 35.6825, lng: 139.6967 },
    ],
    areaSize: 1200,
    devices: ['3'],
    irrigationStatus: IrrigationStatus.SCHEDULED,
    soilMoistureThreshold: 35,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-c',
    name: 'Field Zone C',
    description: 'South field with wheat',
    boundaryCoordinates: [
      { lat: 35.6805, lng: 139.6887 },
      { lat: 35.6825, lng: 139.6907 },
      { lat: 35.6805, lng: 139.6927 },
      { lat: 35.6785, lng: 139.6907 },
    ],
    areaSize: 900,
    devices: [],
    irrigationStatus: IrrigationStatus.INACTIVE,
    soilMoistureThreshold: 25,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
  }
];

interface ZoneFormValues {
  id?: string;
  name: string;
  description: string;
  soilMoistureThreshold?: number;
}

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
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [formValues, setFormValues] = useState<ZoneFormValues>({
    name: '',
    description: '',
    soilMoistureThreshold: 30
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateZone = () => {
    const newZone: Zone = {
      id: uuidv4(),
      name: formValues.name,
      description: formValues.description,
      boundaryCoordinates: [],
      areaSize: 0,
      devices: [],
      irrigationStatus: IrrigationStatus.INACTIVE,
      soilMoistureThreshold: formValues.soilMoistureThreshold,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setZones(prev => [...prev, newZone]);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdateZone = () => {
    if (!formValues.id) return;

    setZones(prev => 
      prev.map(zone => 
        zone.id === formValues.id 
          ? {
              ...zone,
              name: formValues.name,
              description: formValues.description,
              soilMoistureThreshold: formValues.soilMoistureThreshold,
              updatedAt: new Date().toISOString()
            } 
          : zone
      )
    );

    resetForm();
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const handleEditZone = (zone: Zone) => {
    setFormValues({
      id: zone.id,
      name: zone.name,
      description: zone.description || '',
      soilMoistureThreshold: zone.soilMoistureThreshold
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!zoneToDelete) return;
    
    setZones(prev => prev.filter(zone => zone.id !== zoneToDelete));
    
    // Update any devices that were in this zone
    setDevices(prev => 
      prev.map(device => 
        device.zoneId === zoneToDelete 
          ? { ...device, zoneId: undefined } 
          : device
      )
    );
    
    setZoneToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      description: '',
      soilMoistureThreshold: 30
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Zones</h1>
            <p className="text-muted-foreground">Manage your field zones and irrigation settings</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Zone
          </Button>
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
                        <span>{zone.areaSize.toLocaleString()} m²</span>
                      </TableCell>
                      <TableCell>
                        {getIrrigationStatusBadge(zone.irrigationStatus)}
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

      {/* Zone Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the zone information' 
                : 'Fill out the form to add a new zone to your farm'
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
                placeholder="Field Zone A"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                className="col-span-3"
                placeholder="Describe the zone and its purpose"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="soilMoistureThreshold" className="text-right">
                Soil Moisture Threshold
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="soilMoistureThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={formValues.soilMoistureThreshold}
                  onChange={(e) => setFormValues({
                    ...formValues, 
                    soilMoistureThreshold: parseInt(e.target.value) || 0
                  })}
                  className="w-20 mr-2"
                />
                <span>%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={isEditing ? handleUpdateZone : handleCreateZone}>
              {isEditing ? 'Update Zone' : 'Add Zone'}
            </Button>
          </DialogFooter>
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
