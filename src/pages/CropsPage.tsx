
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Layers, CalendarIcon, TrendingUp, Download } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Crop, GrowthStage, Zone } from '@/types';
import CropForm from '@/components/crops/CropForm';
import CropDetails from '@/components/crops/CropDetails';
import CropFilters from '@/components/crops/CropFilters';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchCrops, 
  fetchZones, 
  createCrop, 
  updateCrop, 
  deleteCrop,
  fetchCropById,
  CropFilter
} from '@/utils/cropUtils';
import { Skeleton } from '@/components/ui/skeleton';

const CropsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [filters, setFilters] = useState<CropFilter>({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

  // Fetch zones
  const { 
    data: zones = [], 
    isLoading: zonesLoading 
  } = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
    enabled: !!user
  });

  // Fetch crops with filters
  const { 
    data: crops = [], 
    isLoading: cropsLoading,
    refetch: refetchCrops 
  } = useQuery({
    queryKey: ['crops', filters],
    queryFn: () => fetchCrops(filters),
    enabled: !!user
  });

  // Fetch selected crop details
  const {
    data: selectedCropDetails,
    refetch: refetchSelectedCrop
  } = useQuery({
    queryKey: ['crop', selectedCropId],
    queryFn: () => selectedCropId ? fetchCropById(selectedCropId) : null,
    enabled: !!selectedCropId,
    onSuccess: (data) => {
      if (data) {
        setSelectedCrop(data);
      }
    }
  });

  const handleFilterChange = (newFilters: CropFilter) => {
    setFilters(newFilters);
  };

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

  const handleViewCropDetails = (crop: Crop) => {
    setSelectedCrop(crop);
    setSelectedCropId(crop.id);
    setDetailModalOpen(true);
  };

  const handleSaveCrop = async (crop: Crop) => {
    if (editingCrop) {
      const result = await updateCrop(crop);
      if (result) {
        refetchCrops();
        if (selectedCropId === crop.id) {
          refetchSelectedCrop();
        }
      }
    } else {
      const result = await createCrop(crop);
      if (result) {
        refetchCrops();
      }
    }
    setDialogOpen(false);
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (confirm("Are you sure you want to delete this crop?")) {
      const result = await deleteCrop(cropId);
      if (result) {
        refetchCrops();
        if (detailModalOpen) {
          setDetailModalOpen(false);
        }
      }
    }
  };

  const handleRefreshCropDetails = () => {
    if (selectedCropId) {
      refetchSelectedCrop();
    }
  };

  const downloadCropsCSV = () => {
    if (crops.length === 0) {
      toast.error("No crops data to export");
      return;
    }

    try {
      const headers = ["Name", "Variety", "Planting Date", "Harvest Date", "Growth Stage", "Zone"];
      const rows = crops.map(crop => [
        crop.name,
        crop.variety || '',
        formatDate(crop.plantingDate),
        crop.harvestDate ? formatDate(crop.harvestDate) : '',
        getGrowthStageDisplay(crop.growthStage),
        crop.zoneName || zones.find(z => z.id === crop.zoneId)?.name || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `crops_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Crops data exported successfully");
    } catch (error) {
      console.error("Error exporting crops data:", error);
      toast.error("Failed to export crops data");
    }
  };

  const groupCropsByGrowthStage = () => {
    const grouped: Record<string, number> = {};
    
    crops.forEach(crop => {
      const stage = crop.growthStage || GrowthStage.PLANTING;
      grouped[stage] = (grouped[stage] || 0) + 1;
    });
    
    return grouped;
  };

  const cropsByGrowthStage = groupCropsByGrowthStage();

  // Filter crops for each tab
  const currentCrops = crops.filter(crop => 
    crop.growthStage !== GrowthStage.HARVESTED
  );
  
  const harvestedCrops = crops.filter(crop => 
    crop.growthStage === GrowthStage.HARVESTED
  );

  const upcomingPlantings = crops.filter(crop => {
    const plantingDate = new Date(crop.plantingDate);
    const today = new Date();
    return plantingDate > today;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crops Management</h1>
            <p className="text-muted-foreground">
              Track and manage crop information, planting schedules, and growth stages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCropsCSV}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={handleCreateCrop}>
              <Plus className="mr-2 h-4 w-4" /> Add Crop
            </Button>
          </div>
        </div>

        {!cropsLoading && !zonesLoading && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Total Crops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{crops.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingPlantings.length} upcoming plantings
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Growth Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(cropsByGrowthStage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs">
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}: {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Zones Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{zones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Zones with active crops
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <CropFilters 
          zones={zones} 
          onFilterChange={handleFilterChange} 
        />

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Crops</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Plantings</TabsTrigger>
            <TabsTrigger value="harvested">Harvested</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {cropsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : currentCrops.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No active crops found</p>
                  <Button onClick={handleCreateCrop}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Crop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentCrops.map((crop) => (
                  <Card key={crop.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewCropDetails(crop)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {crop.name}
                            {crop.variety && <span className="ml-1 text-sm font-normal">({crop.variety})</span>}
                          </CardTitle>
                          <CardDescription>{crop.zoneName || zones.find(z => z.id === crop.zoneId)?.name}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => {
                            e.stopPropagation();
                            handleEditCrop(crop);
                          }}>
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
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
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm font-medium">{getGrowthStageDisplay(crop.growthStage)}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCrop(crop.id);
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {cropsLoading ? (
              <Card>
                <CardContent className="py-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ) : upcomingPlantings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No upcoming plantings scheduled</p>
                  <Button onClick={handleCreateCrop}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Planting
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingPlantings.map((crop) => (
                  <Card key={crop.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewCropDetails(crop)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {crop.name}
                            {crop.variety && <span className="ml-1 text-sm font-normal">({crop.variety})</span>}
                          </CardTitle>
                          <CardDescription>{crop.zoneName || zones.find(z => z.id === crop.zoneId)?.name}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <CalendarIcon className="mr-1 h-3 w-3" /> Planting Date:
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="harvested" className="space-y-4">
            {cropsLoading ? (
              <Card>
                <CardContent className="py-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ) : harvestedCrops.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No harvested crops recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {harvestedCrops.map((crop) => (
                  <Card key={crop.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewCropDetails(crop)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {crop.name}
                            {crop.variety && <span className="ml-1 text-sm font-normal">({crop.variety})</span>}
                          </CardTitle>
                          <CardDescription>{crop.zoneName || zones.find(z => z.id === crop.zoneId)?.name}</CardDescription>
                        </div>
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
                              <CalendarIcon className="mr-1 h-3 w-3" /> Harvested:
                            </span>
                            <span>{formatDate(crop.harvestDate)}</span>
                          </div>
                        )}
                        {crop.estimatedYield && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <TrendingUp className="mr-1 h-3 w-3" /> Yield:
                            </span>
                            <span>{crop.estimatedYield} kg</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crop Details</DialogTitle>
          </DialogHeader>
          
          {selectedCrop && (
            <CropDetails 
              crop={selectedCrop}
              onEdit={() => {
                setDetailModalOpen(false);
                setEditingCrop(selectedCrop);
                setDialogOpen(true);
              }}
              onDelete={() => {
                handleDeleteCrop(selectedCrop.id);
              }}
              onRefresh={handleRefreshCropDetails}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CropsPage;
