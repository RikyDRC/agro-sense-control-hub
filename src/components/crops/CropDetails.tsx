
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Layers, Droplet, Thermometer, Ruler, Leaf, BarChart, FileText, Camera } from 'lucide-react';
import { Crop, GrowthStage, CropImage } from '@/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CropGrowthTimeline from './CropGrowthTimeline';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import CropImageUpload from './CropImageUpload';

interface CropDetailsProps {
  crop: Crop;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const CropDetails: React.FC<CropDetailsProps> = ({ 
  crop, 
  onEdit, 
  onDelete,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const getGrowthStageDisplay = (stage: GrowthStage) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  // Helper to calculate days remaining until harvest
  const getDaysUntilHarvest = () => {
    if (!crop.harvestDate) return null;
    
    const today = new Date();
    const harvestDate = new Date(crop.harvestDate);
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to calculate growth progress
  const getGrowthProgress = () => {
    if (!crop.plantingDate || !crop.harvestDate) return null;
    
    const plantingDate = new Date(crop.plantingDate);
    const harvestDate = new Date(crop.harvestDate);
    const today = new Date();
    
    const totalGrowthTime = harvestDate.getTime() - plantingDate.getTime();
    const elapsedTime = today.getTime() - plantingDate.getTime();
    
    if (elapsedTime < 0) return 0;
    if (elapsedTime > totalGrowthTime) return 100;
    
    return Math.round((elapsedTime / totalGrowthTime) * 100);
  };

  const handleImageAdded = (image: CropImage) => {
    setIsImageUploadModalOpen(false);
    onRefresh();
  };

  const handleImageDeleted = (imageId: string) => {
    onRefresh();
  };

  const growthProgress = getGrowthProgress();
  const daysUntilHarvest = getDaysUntilHarvest();

  return (
    <>
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growthTimeline">Growth Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {crop.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={crop.imageUrl} 
                  alt={crop.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {crop.name}
                    {crop.variety && <span className="ml-1 text-sm font-normal">({crop.variety})</span>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{crop.zoneName}</p>
                </div>
                <Badge>{getGrowthStageDisplay(crop.growthStage)}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
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
                    <Thermometer className="mr-1 h-3 w-3" /> Ideal Temperature:
                  </span>
                  <span>{crop.idealTemperature.min}°C - {crop.idealTemperature.max}°C</span>
                </div>
                
                {crop.growthDays && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Leaf className="mr-1 h-3 w-3" /> Growth Days:
                    </span>
                    <span>{crop.growthDays} days</span>
                  </div>
                )}
                
                {crop.plantSpacing && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Ruler className="mr-1 h-3 w-3" /> Plant Spacing:
                    </span>
                    <span>{crop.plantSpacing} cm</span>
                  </div>
                )}
                
                {crop.seedSource && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Layers className="mr-1 h-3 w-3" /> Seed Source:
                    </span>
                    <span>{crop.seedSource}</span>
                  </div>
                )}
                
                {crop.estimatedYield && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <BarChart className="mr-1 h-3 w-3" /> Estimated Yield:
                    </span>
                    <span>{crop.estimatedYield} kg</span>
                  </div>
                )}
              </div>
              
              {growthProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Growth Progress</span>
                    <span>{growthProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full", 
                        growthProgress < 33 ? "bg-blue-500" : 
                        growthProgress < 66 ? "bg-yellow-500" : 
                        "bg-green-500"
                      )}
                      style={{ width: `${growthProgress}%` }}
                    />
                  </div>
                  {daysUntilHarvest !== null && (
                    <p className="text-xs text-right text-muted-foreground">
                      {daysUntilHarvest} days until harvest
                    </p>
                  )}
                </div>
              )}
              
              {crop.notes && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm font-medium">
                    <FileText className="mr-1 h-4 w-4" /> Notes
                  </div>
                  <p className="text-sm text-muted-foreground">{crop.notes}</p>
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="growthTimeline" className="p-4">
            <CropGrowthTimeline 
              images={crop.images || []}
              onAddImage={() => setIsImageUploadModalOpen(true)}
              onImageDeleted={handleImageDeleted}
            />
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-end gap-2">
          <button onClick={onEdit} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
          <button onClick={onDelete} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </CardFooter>
      </Card>
      
      <Dialog open={isImageUploadModalOpen} onOpenChange={setIsImageUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Growth Image</DialogTitle>
          </DialogHeader>
          <CropImageUpload 
            cropId={crop.id}
            onImageAdded={handleImageAdded}
            onCancel={() => setIsImageUploadModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CropDetails;
