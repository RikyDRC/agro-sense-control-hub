
import { supabase } from '@/integrations/supabase/client';
import { Crop, GrowthStage, Zone, CropImage, IrrigationStatus } from '@/types';
import { toast } from '@/components/ui/sonner';

export interface CropFilter {
  growthStage?: GrowthStage | '';
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
      // Properly handle the growthStage filter with type checking
      if (filters.growthStage && filters.growthStage !== '' as GrowthStage | '') {
        // Cast the GrowthStage enum value to string for the database query
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
    
    // Fetch images for each crop
    const cropsWithData = await Promise.all(
      data.map(async (cropData) => {
        const crop = cropFromDb(cropData);
        
        // Fetch images for this crop
        const { data: imageData, error: imageError } = await supabase
          .from('crop_images')
          .select('*')
          .eq('crop_id', crop.id)
          .order('capture_date', { ascending: true });
        
        if (!imageError && imageData) {
          crop.images = imageData.map(img => ({
            id: img.id,
            cropId: img.crop_id,
            imageUrl: img.image_url,
            captureDate: img.capture_date,
            notes: img.notes,
            createdAt: img.created_at
          }));
        }
        
        return crop;
      })
    );
    
    return cropsWithData;
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
    
    const crop = cropFromDb(data);
    
    // Fetch images for this crop
    const { data: imageData, error: imageError } = await supabase
      .from('crop_images')
      .select('*')
      .eq('crop_id', cropId)
      .order('capture_date', { ascending: true });
    
    if (!imageError && imageData) {
      crop.images = imageData.map(img => ({
        id: img.id,
        cropId: img.crop_id,
        imageUrl: img.image_url,
        captureDate: img.capture_date,
        notes: img.notes,
        createdAt: img.created_at
      }));
    }
    
    return crop;
  } catch (error: any) {
    console.error('Error fetching crop by ID:', error);
    toast.error('Failed to load crop details: ' + error.message);
    return null;
  }
};

export const createCrop = async (crop: Omit<Crop, 'id'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create a crop');
      return null;
    }
    
    const cropForDb = {
      ...cropToDb(crop),
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('crops')
      .insert(cropForDb as any)
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to update a crop');
      return null;
    }
    
    const cropForDb = {
      ...cropToDb(crop),
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('crops')
      .update(cropForDb as any)
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
    
    // Convert to Zone type with proper type casting for enum types
    return data.map(zone => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      boundaryCoordinates: (zone.boundary_coordinates || []) as unknown as Zone['boundaryCoordinates'],
      areaSize: zone.area_size,
      devices: [],
      irrigationStatus: zone.irrigation_status as IrrigationStatus,
      soilMoistureThreshold: zone.soil_moisture_threshold,
      soilType: zone.soil_type,
      cropType: zone.crop_type,
      irrigationMethod: zone.irrigation_method,
      notes: zone.notes,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at
    }));
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    toast.error('Failed to load zones: ' + error.message);
    return [];
  }
};

// Functions for crop images
export const addCropImage = async (cropId: string, imageUrl: string, captureDate: Date, notes?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to add an image');
      return null;
    }
    
    const { data, error } = await supabase
      .from('crop_images')
      .insert({
        crop_id: cropId,
        image_url: imageUrl,
        capture_date: captureDate.toISOString(),
        notes: notes,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('Image added successfully');
    return {
      id: data.id,
      cropId: data.crop_id,
      imageUrl: data.image_url,
      captureDate: data.capture_date,
      notes: data.notes,
      createdAt: data.created_at
    } as CropImage;
  } catch (error: any) {
    console.error('Error adding crop image:', error);
    toast.error('Failed to add image: ' + error.message);
    return null;
  }
};

export const deleteCropImage = async (imageId: string) => {
  try {
    const { error } = await supabase
      .from('crop_images')
      .delete()
      .eq('id', imageId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Image deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting crop image:', error);
    toast.error('Failed to delete image: ' + error.message);
    return false;
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
    updatedAt: dbCrop.updated_at,
    images: []
  };
};

const cropToDb = (crop: Omit<Crop, 'id'> | Crop) => {
  const { zoneName, images, ...rest } = crop as Crop & { zoneName?: string; images?: CropImage[] };
  
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
