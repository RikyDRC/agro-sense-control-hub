
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Device } from '@/types';
import { toast } from '@/components/ui/sonner';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDevices: Device[] = data.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type as any,
        status: device.status as any,
        batteryLevel: device.battery_level,
        lastReading: device.last_reading,
        lastUpdated: device.last_updated,
        location: device.location as any,
        zoneId: device.zone_id
      }));

      setDevices(formattedDevices);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: any) => {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ status })
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.map(device => 
        device.id === deviceId ? { ...device, status } : device
      ));

      return true;
    } catch (err) {
      console.error('Error updating device status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    loading,
    error,
    updateDeviceStatus,
    refetch: fetchDevices
  };
};
