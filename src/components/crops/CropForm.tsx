
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Crop, GrowthStage, Zone } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CropFormProps {
  zones: Zone[];
  onSubmit: (crop: Crop) => void;
  onCancel: () => void;
  initialValues?: Partial<Crop>;
}

const CropForm: React.FC<CropFormProps> = ({
  zones,
  onSubmit,
  onCancel,
  initialValues
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [variety, setVariety] = useState(initialValues?.variety || '');
  const [plantingDate, setPlantingDate] = useState<Date | undefined>(
    initialValues?.plantingDate ? new Date(initialValues.plantingDate) : undefined
  );
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(
    initialValues?.harvestDate ? new Date(initialValues.harvestDate) : undefined
  );
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    initialValues?.growthStage || GrowthStage.PLANTING
  );
  const [idealMoistureMin, setIdealMoistureMin] = useState<number>(
    initialValues?.idealMoisture?.min || 60
  );
  const [idealMoistureMax, setIdealMoistureMax] = useState<number>(
    initialValues?.idealMoisture?.max || 80
  );
  const [idealTempMin, setIdealTempMin] = useState<number>(
    initialValues?.idealTemperature?.min || 18
  );
  const [idealTempMax, setIdealTempMax] = useState<number>(
    initialValues?.idealTemperature?.max || 26
  );
  const [zoneId, setZoneId] = useState(initialValues?.zoneId || '');
  
  // New fields
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [plantSpacing, setPlantSpacing] = useState<number | undefined>(initialValues?.plantSpacing);
  const [seedSource, setSeedSource] = useState(initialValues?.seedSource || '');
  const [estimatedYield, setEstimatedYield] = useState<number | undefined>(initialValues?.estimatedYield);
  const [growthDays, setGrowthDays] = useState<number | undefined>(initialValues?.growthDays);
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plantingDate) {
      alert("Planting date is required");
      return;
    }
    
    const crop: Crop = {
      id: initialValues?.id || uuidv4(),
      name,
      variety: variety || undefined,
      plantingDate: plantingDate.toISOString(),
      harvestDate: harvestDate?.toISOString(),
      growthStage,
      idealMoisture: {
        min: idealMoistureMin,
        max: idealMoistureMax
      },
      idealTemperature: {
        min: idealTempMin,
        max: idealTempMax
      },
      zoneId,
      notes,
      plantSpacing,
      seedSource,
      estimatedYield,
      growthDays,
      imageUrl
    };
    
    onSubmit(crop);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="growth">Growth Details</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tomatoes"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variety">Variety (Optional)</Label>
              <Input
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g., Roma"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <DatePicker
                selected={plantingDate}
                onSelect={setPlantingDate}
                placeholder="Select planting date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Expected Harvest Date (Optional)</Label>
              <DatePicker
                selected={harvestDate}
                onSelect={setHarvestDate}
                placeholder="Select harvest date"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="growthStage">Growth Stage</Label>
            <Select 
              value={growthStage} 
              onValueChange={(value) => setGrowthStage(value as GrowthStage)}
            >
              <SelectTrigger>
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
            <Label htmlFor="zone">Zone</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="space-y-2">
            <Label>Ideal Moisture Range (%)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="moistureMin" className="text-xs">Min</Label>
                <Input
                  id="moistureMin"
                  type="number"
                  value={idealMoistureMin}
                  onChange={(e) => setIdealMoistureMin(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="moistureMax" className="text-xs">Max</Label>
                <Input
                  id="moistureMax"
                  type="number"
                  value={idealMoistureMax}
                  onChange={(e) => setIdealMoistureMax(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Ideal Temperature Range (°C)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="tempMin" className="text-xs">Min</Label>
                <Input
                  id="tempMin"
                  type="number"
                  value={idealTempMin}
                  onChange={(e) => setIdealTempMin(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="tempMax" className="text-xs">Max</Label>
                <Input
                  id="tempMax"
                  type="number"
                  value={idealTempMax}
                  onChange={(e) => setIdealTempMax(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="growthDays">Growth Days</Label>
              <Input
                id="growthDays"
                type="number"
                value={growthDays || ''}
                onChange={(e) => setGrowthDays(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantSpacing">Plant Spacing (cm)</Label>
              <Input
                id="plantSpacing"
                type="number"
                value={plantSpacing || ''}
                onChange={(e) => setPlantSpacing(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g., 30"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seedSource">Seed Source</Label>
            <Input
              id="seedSource"
              value={seedSource}
              onChange={(e) => setSeedSource(e.target.value)}
              placeholder="e.g., Local Supplier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedYield">Estimated Yield (kg)</Label>
            <Input
              id="estimatedYield"
              type="number"
              value={estimatedYield || ''}
              onChange={(e) => setEstimatedYield(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., 300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this crop"
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues?.id ? 'Update Crop' : 'Add Crop'}
        </Button>
      </div>
    </form>
  );
};

export default CropForm;
