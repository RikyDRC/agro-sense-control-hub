
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus, Layers, Droplet, Thermometer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Crop, GrowthStage, IrrigationStatus } from '@/types';

// Mock data
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

// Mock zones
const zones = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    irrigationStatus: IrrigationStatus.ACTIVE
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    irrigationStatus: IrrigationStatus.SCHEDULED
  }
];

const CropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [activeTab, setActiveTab] = useState('current');

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Helper function to get growth stage display name
  const getGrowthStageDisplay = (stage: GrowthStage) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Crop
              </Button>
            </div>

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
                    <div className="flex justify-end mt-4">
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Crop Planning</CardTitle>
                <CardDescription>Plan your future crop rotations and planting schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Planting Date</h3>
                      <DatePicker placeholder="Select date" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Harvest Date</h3>
                      <DatePicker placeholder="Select date" />
                    </div>
                  </div>
                </div>
                <p>Additional crop planning tools will be available here.</p>
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
                <p>Historical crop data will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CropsPage;
