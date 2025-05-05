
import { supabase } from '@/integrations/supabase/client';
import { Crop, GrowthStage, Zone } from '@/types';
import { toast } from '@/components/ui/sonner';

export interface CropFilter {
  growthStage?: GrowthStage;
  zoneId?: string;
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
}

export const fetchCrops = async (filters?: CropFilter) => {
  try {
    let query = supabase
      .from('crops')
      .select(`
        *,
        zones:zones(id, name)
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.growthStage) {
        query = query.eq('growth_stage', filters.growthStage);
      }
      
      if (filters.zoneId) {
        query = query.eq('zone_id', filters.zoneId);
      }
      
      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,variety.ilike.%${filters.searchQuery}%`);
      }
      
      if (filters.startDate) {
        query = query.gte('planting_date', filters.startDate.toISOString().split('T')[0]);
      }
      
      if (filters.endDate) {
        query = query.lte('planting_date', filters.endDate.toISOString().split('T')[0]);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data.map(cropFromDb);
  } catch (error: any) {
    console.error('Error fetching crops:', error);
    toast.error('Failed to load crops: ' + error.message);
    return [];
  }
};

export const fetchCropById = async (cropId: string) => {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select(`
        *,
        zones:zones(id, name)
      `)
      .eq('id', cropId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return cropFromDb(data);
  } catch (error: any) {
    console.error('Error fetching crop by ID:', error);
    toast.error('Failed to load crop details: ' + error.message);
    return null;
  }
};

export const createCrop = async (crop: Omit<Crop, 'id'>) => {
  try {
    const cropForDb = cropToDb(crop);
    
    const { data, error } = await supabase
      .from('crops')
      .insert(cropForDb)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('Crop created successfully');
    return cropFromDb(data);
  } catch (error: any) {
    console.error('Error creating crop:', error);
    toast.error('Failed to create crop: ' + error.message);
    return null;
  }
};

export const updateCrop = async (crop: Crop) => {
  try {
    const cropForDb = cropToDb(crop);
    
    const { data, error } = await supabase
      .from('crops')
      .update(cropForDb)
      .eq('id', crop.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('Crop updated successfully');
    return cropFromDb(data);
  } catch (error: any) {
    console.error('Error updating crop:', error);
    toast.error('Failed to update crop: ' + error.message);
    return null;
  }
};

export const deleteCrop = async (cropId: string) => {
  try {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Crop deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting crop:', error);
    toast.error('Failed to delete crop: ' + error.message);
    return false;
  }
};

export const fetchZones = async () => {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data as Zone[];
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    toast.error('Failed to load zones: ' + error.message);
    return [];
  }
};

// Helper functions to convert between DB and app formats
const cropFromDb = (dbCrop: any): Crop => {
  return {
    id: dbCrop.id,
    name: dbCrop.name,
    variety: dbCrop.variety || undefined,
    plantingDate: dbCrop.planting_date,
    harvestDate: dbCrop.harvest_date || undefined,
    growthStage: dbCrop.growth_stage as GrowthStage,
    idealMoisture: dbCrop.ideal_moisture,
    idealTemperature: dbCrop.ideal_temperature,
    zoneId: dbCrop.zone_id,
    zoneName: dbCrop.zones?.name,
    notes: dbCrop.notes || undefined,
    plantSpacing: dbCrop.plant_spacing || undefined,
    seedSource: dbCrop.seed_source || undefined,
    estimatedYield: dbCrop.estimated_yield || undefined,
    growthDays: dbCrop.growth_days || undefined,
    imageUrl: dbCrop.image_url || undefined,
    createdAt: dbCrop.created_at,
    updatedAt: dbCrop.updated_at
  };
};

const cropToDb = (crop: Omit<Crop, 'id'> | Crop) => {
  const { zoneName, ...rest } = crop as Crop & { zoneName?: string };
  
  return {
    name: rest.name,
    variety: rest.variety || null,
    planting_date: rest.plantingDate,
    harvest_date: rest.harvestDate || null,
    growth_stage: rest.growthStage,
    zone_id: rest.zoneId,
    ideal_moisture: rest.idealMoisture,
    ideal_temperature: rest.idealTemperature,
    notes: rest.notes || null,
    plant_spacing: rest.plantSpacing || null,
    seed_source: rest.seedSource || null,
    estimated_yield: rest.estimatedYield || null,
    growth_days: rest.growthDays || null,
    image_url: rest.imageUrl || null,
    ...(('id' in rest) ? { id: rest.id } : {})
  };
};
