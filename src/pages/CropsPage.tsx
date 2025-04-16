
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Pencil, Trash2, Sprout, Calendar, Thermometer, 
  Droplets, Check, X 
} from 'lucide-react';
import { Crop, GrowthStage, Zone } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock data for zones
const mockZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'North field with corn',
    boundaryCoordinates: [],
    areaSize: 1000,
    devices: ['1', '2'],
    irrigationStatus: 'active',
    soilMoistureThreshold: 30,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'East field with soybeans',
    boundaryCoordinates: [],
    areaSize: 1200,
    devices: ['3'],
    irrigationStatus: 'scheduled',
    soilMoistureThreshold: 35,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for crops
const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Corn',
    variety: 'Sweet Yellow',
    plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    harvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    growthStage: GrowthStage.VEGETATIVE,
    idealMoisture: {
      min: 25,
      max: 40
    },
    idealTemperature: {
      min: 18,
      max: 30
    },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Soybeans',
    variety: 'Glycine max',
    plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    harvestDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    growthStage: GrowthStage.FLOWERING,
    idealMoisture: {
      min: 20,
      max: 35
    },
    idealTemperature: {
      min: 20,
      max: 32
    },
    zoneId: 'zone-b'
  }
];

interface CropFormValues {
  id?: string;
  name: string;
  variety: string;
  plantingDate: Date | undefined;
  harvestDate: Date | undefined;
  growthStage: GrowthStage;
  idealMoistureMin: number;
  idealMoistureMax: number;
  idealTempMin: number;
  idealTempMax: number;
  zoneId: string;
}

const getGrowthStageBadge = (stage: GrowthStage) => {
  const stageColors: Record<GrowthStage, string> = {
    [GrowthStage.PLANTING]: 'bg-blue-500',
    [GrowthStage.GERMINATION]: 'bg-cyan-500',
    [GrowthStage.VEGETATIVE]: 'bg-green-500',
    [GrowthStage.FLOWERING]: 'bg-yellow-500',
    [GrowthStage.FRUITING]: 'bg-orange-500',
    [GrowthStage.HARVEST]: 'bg-red-500'
  };

  return (
    <Badge className={`${stageColors[stage]} text-white`}>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </Badge>
  );
};

const initialFormValues: CropFormValues = {
  name: '',
  variety: '',
  plantingDate: undefined,
  harvestDate: undefined,
  growthStage: GrowthStage.PLANTING,
  idealMoistureMin: 20,
  idealMoistureMax: 35,
  idealTempMin: 18,
  idealTempMax: 30,
  zoneId: ''
};

const CropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>(mockCrops);
  const [zones] = useState<Zone[]>(mockZones);
  const [formValues, setFormValues] = useState<CropFormValues>(initialFormValues);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateCrop = () => {
    if (!formValues.plantingDate) return;

    const newCrop: Crop = {
      id: uuidv4(),
      name: formValues.name,
      variety: formValues.variety,
      plantingDate: formValues.plantingDate.toISOString(),
      harvestDate: formValues.harvestDate?.toISOString(),
      growthStage: formValues.growthStage,
      idealMoisture: {
        min: formValues.idealMoistureMin,
        max: formValues.idealMoistureMax
      },
      idealTemperature: {
        min: formValues.idealTempMin,
        max: formValues.idealTempMax
      },
      zoneId: formValues.zoneId
    };

    setCrops(prev => [...prev, newCrop]);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdateCrop = () => {
    if (!formValues.id || !formValues.plantingDate) return;

    setCrops(prev => 
      prev.map(crop => 
        crop.id === formValues.id 
          ? {
              ...crop,
              name: formValues.name,
              variety: formValues.variety,
              plantingDate: formValues.plantingDate.toISOString(),
              harvestDate: formValues.harvestDate?.toISOString(),
              growthStage: formValues.growthStage,
              idealMoisture: {
                min: formValues.idealMoistureMin,
                max: formValues.idealMoistureMax
              },
              idealTemperature: {
                min: formValues.idealTempMin,
                max: formValues.idealTempMax
              },
              zoneId: formValues.zoneId
            } 
          : crop
      )
    );

    resetForm();
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const handleEditCrop = (crop: Crop) => {
    setFormValues({
      id: crop.id,
      name: crop.name,
      variety: crop.variety || '',
      plantingDate: new Date(crop.plantingDate),
      harvestDate: crop.harvestDate ? new Date(crop.harvestDate) : undefined,
      growthStage: crop.growthStage,
      idealMoistureMin: crop.idealMoisture.min,
      idealMoistureMax: crop.idealMoisture.max,
      idealTempMin: crop.idealTemperature.min,
      idealTempMax: crop.idealTemperature.max,
      zoneId: crop.zoneId
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!cropToDelete) return;
    
    setCrops(prev => prev.filter(crop => crop.id !== cropToDelete));
    setCropToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const resetForm = () => {
    setFormValues(initialFormValues);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crops</h1>
            <p className="text-muted-foreground">Manage your crop information and growth tracking</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Crop
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Growth Stage</TableHead>
                  <TableHead>Planting Date</TableHead>
                  <TableHead>Expected Harvest</TableHead>
                  <TableHead>Ideal Conditions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <p className="text-muted-foreground">No crops found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-green-100">
                            <Sprout className="h-5 w-5 text-green-700" />
                          </div>
                          <span className="font-medium">{crop.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{crop.variety || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        {zones.find(zone => zone.id === crop.zoneId)?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {getGrowthStageBadge(crop.growthStage)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(crop.plantingDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {crop.harvestDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{new Date(crop.harvestDate).toLocaleDateString()}</span>
                          </div>
                        ) : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Droplets className="h-3 w-3 text-blue-500" />
                            <span>Moisture: {crop.idealMoisture.min}% - {crop.idealMoisture.max}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Thermometer className="h-3 w-3 text-red-500" />
                            <span>Temp: {crop.idealTemperature.min}°C - {crop.idealTemperature.max}°C</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditCrop(crop)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => {
                              setCropToDelete(crop.id);
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
      </div>

      {/* Crop Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update crop information and growth parameters' 
                : 'Fill out the form to add a new crop to your field management'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Crop Name</Label>
                <Input
                  id="name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({...formValues, name: e.target.value})}
                  placeholder="Corn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variety (Optional)</Label>
                <Input
                  id="variety"
                  value={formValues.variety}
                  onChange={(e) => setFormValues({...formValues, variety: e.target.value})}
                  placeholder="Sweet Yellow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthStage">Current Growth Stage</Label>
                <Select 
                  value={formValues.growthStage} 
                  onValueChange={(value) => setFormValues({...formValues, growthStage: value as GrowthStage})}
                >
                  <SelectTrigger id="growthStage">
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GrowthStage).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Field Zone</Label>
                <Select 
                  value={formValues.zoneId} 
                  onValueChange={(value) => setFormValues({...formValues, zoneId: value})}
                >
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <DatePicker
                  selected={formValues.plantingDate}
                  onSelect={(date) => setFormValues({...formValues, plantingDate: date})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Expected Harvest Date (Optional)</Label>
                <DatePicker
                  selected={formValues.harvestDate}
                  onSelect={(date) => setFormValues({...formValues, harvestDate: date})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moistureMin">Min Moisture (%)</Label>
                  <Input
                    id="moistureMin"
                    type="number"
                    value={formValues.idealMoistureMin}
                    onChange={(e) => setFormValues({...formValues, idealMoistureMin: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moistureMax">Max Moisture (%)</Label>
                  <Input
                    id="moistureMax"
                    type="number"
                    value={formValues.idealMoistureMax}
                    onChange={(e) => setFormValues({...formValues, idealMoistureMax: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tempMin">Min Temp (°C)</Label>
                  <Input
                    id="tempMin"
                    type="number"
                    value={formValues.idealTempMin}
                    onChange={(e) => setFormValues({...formValues, idealTempMin: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempMax">Max Temp (°C)</Label>
                  <Input
                    id="tempMax"
                    type="number"
                    value={formValues.idealTempMax}
                    onChange={(e) => setFormValues({...formValues, idealTempMax: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={isEditing ? handleUpdateCrop : handleCreateCrop}>
              {isEditing ? 'Update Crop' : 'Add Crop'}
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
              Are you sure you want to delete this crop? This action cannot be undone.
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

export default CropsPage;
