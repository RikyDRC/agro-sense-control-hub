
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Crop, CropGrowthStage, Zone } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
  const [growthStage, setGrowthStage] = useState<CropGrowthStage>(
    initialValues?.growthStage || CropGrowthStage.PLANTING
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
      zoneId
    };
    
    onSubmit(crop);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onValueChange={(value) => setGrowthStage(value as CropGrowthStage)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select growth stage" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CropGrowthStage).map((stage) => (
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
