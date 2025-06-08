
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SensorReading } from '@/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useSensorReadings = (deviceId?: string) => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    if (!user) {
      setReadings([]);
      setLatestReading(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .eq('user_id', user.id) // Ensure only user's sensor readings are fetched
        .order('timestamp', { ascending: false });

      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      const formattedReadings: SensorReading[] = data.map(reading => ({
        id: reading.id,
        deviceId: reading.device_id,
        timestamp: reading.timestamp,
        value: reading.value,
        unit: reading.unit
      }));

      setReadings(formattedReadings);
      setLatestReading(formattedReadings[0] || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor readings:', err);
      setError('Failed to load sensor readings');
    } finally {
      setLoading(false);
    }
  };

  const getLatestReadingForDevice = async (deviceId: string): Promise<SensorReading | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('device_id', deviceId)
        .eq('user_id', user.id) // Ensure only user's sensor readings
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No data found
        throw error;
      }

      return {
        id: data.id,
        deviceId: data.device_id,
        timestamp: data.timestamp,
        value: data.value,
        unit: data.unit
      };
    } catch (err) {
      console.error('Error fetching latest reading:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [deviceId, user]);

  return {
    readings,
    latestReading,
    loading,
    error,
    getLatestReadingForDevice,
    refetch: fetchReadings
  };
};
