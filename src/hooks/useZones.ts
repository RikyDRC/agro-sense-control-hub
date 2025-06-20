
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Zone } from '@/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useZones = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    if (!user) {
      setZones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('user_id', user.id) // Ensure only user's zones are fetched
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedZones: Zone[] = data.map(zone => ({
        id: zone.id,
        name: zone.name,
        description: zone.description,
        boundaryCoordinates: zone.boundary_coordinates as any,
        areaSize: zone.area_size,
        devices: [], // Will be populated separately
        irrigationStatus: zone.irrigation_status as any,
        soilMoistureThreshold: zone.soil_moisture_threshold,
        soilType: zone.soil_type,
        cropType: zone.crop_type,
        irrigationMethod: zone.irrigation_method,
        notes: zone.notes,
        createdAt: zone.created_at,
        updatedAt: zone.updated_at
      }));

      setZones(formattedZones);
      setError(null);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError('Failed to load zones');
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [user]);

  return {
    zones,
    loading,
    error,
    refetch: fetchZones
  };
};
