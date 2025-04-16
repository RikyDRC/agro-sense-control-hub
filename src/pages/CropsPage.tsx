import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus, Layers, Droplet, Thermometer, ArrowUpRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Crop, GrowthStage, IrrigationStatus, Zone } from '@/types';
import CropForm from '@/components/crops/CropForm';

const initialCrops: Crop[] = [
  {
    id: '1',
    name: 'Tomatoes',
    variety: 'Roma',
    plantingDate: '2023-04-15',
    harvestDate: '2023-07-20',
    growthStage: GrowthStage.VEGETATIVE,
    idealMoisture: {
      min: 60,
      max: 80
    },
    idealTemperature: {
      min: 18,
      max: 26
    },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Lettuce',
    variety: 'Butterhead',
    plantingDate: '2023-05-01',
    harvestDate: '2023-06-15',
    growthStage: GrowthStage.FLOWERING,
    idealMoisture: {
      min: 70,
      max: 90
    },
    idealTemperature: {
      min: 15,
      max: 22
    },
    zoneId: 'zone-b'
  }
];

const zones: Zone[] = [
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

const CropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [activeTab, setActiveTab] = useState('current');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [planningStart, setPlanningStart] = useState<Date>();
  const [planningEnd, setPlanningEnd] = useState<Date>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const getGrowthStageDisplay = (stage: GrowthStage) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  const handleCreateCrop = () => {
    setEditingCrop(null);
    setDialogOpen(true);
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setDialogOpen(true);
  };

  const handleSaveCrop = (crop: Crop) => {
    if (crop.id && crops.some(c => c.id === crop.id)) {
      setCrops(prev => prev.map(c => c.id === crop.id ? crop : c));
      toast.success("Crop updated successfully");
    } else {
      setCrops(prev => [...prev, crop]);
      toast.success("Crop added successfully");
    }
    setDialogOpen(false);
  };

  const handleDeleteCrop = (cropId: string) => {
    setCrops(prev => prev.filter(crop => crop.id !== cropId));
    toast.success("Crop deleted successfully");
  };

  const handlePlanningSubmit = () => {
    if (!planningStart || !planningEnd) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    if (planningStart > planningEnd) {
      toast.error("Start date must be before end date");
      return;
    }
    
    toast.success("Crop planning period set");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Crops Management</h1>
          <p className="text-muted-foreground">
            Track and manage crop information, planting schedules, and growth stages
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Crops</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Current Crops</h2>
              <Button onClick={handleCreateCrop}>
                <Plus className="mr-2 h-4 w-4" /> Add Crop
              </Button>
            </div>

            {crops.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <p className="text-muted-foreground mb-4">No crops found</p>
                  <Button onClick={handleCreateCrop}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Crop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {crops.map((crop) => (
                  <Card key={crop.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {crop.name}
                            {crop.variety && <span className="ml-1 text-sm font-normal">({crop.variety})</span>}
                          </CardTitle>
                          <CardDescription>{zones.find(z => z.id === crop.zoneId)?.name}</CardDescription>
                        </div>
                        <Badge>{getGrowthStageDisplay(crop.growthStage)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <CalendarIcon className="mr-1 h-3 w-3" /> Planted:
                          </span>
                          <span>{formatDate(crop.plantingDate)}</span>
                        </div>
                        {crop.harvestDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <CalendarIcon className="mr-1 h-3 w-3" /> Expected Harvest:
                            </span>
                            <span>{formatDate(crop.harvestDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Droplet className="mr-1 h-3 w-3" /> Ideal Moisture:
                          </span>
                          <span>{crop.idealMoisture.min}% - {crop.idealMoisture.max}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Thermometer className="mr-1 h-3 w-3" /> Ideal Temp:
                          </span>
                          <span>{crop.idealTemperature.min}°C - {crop.idealTemperature.max}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <Layers className="mr-1 h-3 w-3" /> Zone Status:
                          </span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {zones.find(z => z.id === crop.zoneId)?.irrigationStatus === IrrigationStatus.ACTIVE ? 
                              'Irrigating' : 'Scheduled'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleEditCrop(crop)}>
                          <ArrowUpRight className="h-3 w-3 mr-1" /> Manage
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteCrop(crop.id)}>
                          <X className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Crop Planning</CardTitle>
                <CardDescription>Plan your future crop rotations and planting schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Planting Date</h3>
                      <DatePicker 
                        selected={planningStart}
                        onSelect={setPlanningStart}
                        placeholder="Select date" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Harvest Date</h3>
                      <DatePicker 
                        selected={planningEnd}
                        onSelect={setPlanningEnd}
                        placeholder="Select date" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Recommended Crops for Selected Period</h3>
                  
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p className="text-muted-foreground">
                      Select a date range to view crop recommendations
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handlePlanningSubmit}>Apply Planning</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Crop History</CardTitle>
                <CardDescription>View your past crops and their performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Historical Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Once crops are harvested, their data will appear here for analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
            <DialogDescription>
              {editingCrop 
                ? 'Modify crop details and growth parameters' 
                : 'Enter details about the crop you are planting'
              }
            </DialogDescription>
          </DialogHeader>
          
          <CropForm
            zones={zones}
            onSubmit={handleSaveCrop}
            onCancel={() => setDialogOpen(false)}
            initialValues={editingCrop || undefined}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CropsPage;
