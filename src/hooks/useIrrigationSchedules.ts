
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface IrrigationSchedule {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  deviceId: string;
  startTime: string;
  duration: number;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useIrrigationSchedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    if (!user) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .select('*')
        .eq('user_id', user.id) // Ensure only user's irrigation schedules are fetched
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSchedules: IrrigationSchedule[] = data.map(schedule => ({
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        zoneId: schedule.zone_id,
        deviceId: schedule.device_id,
        startTime: schedule.start_time,
        duration: schedule.duration,
        daysOfWeek: schedule.days_of_week,
        isActive: schedule.is_active,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      }));

      setSchedules(formattedSchedules);
      setError(null);
    } catch (err) {
      console.error('Error fetching irrigation schedules:', err);
      setError('Failed to load irrigation schedules');
      toast.error('Failed to load irrigation schedules');
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (schedule: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .insert({
          name: schedule.name,
          description: schedule.description,
          zone_id: schedule.zoneId,
          device_id: schedule.deviceId,
          start_time: schedule.startTime,
          duration: schedule.duration,
          days_of_week: schedule.daysOfWeek,
          is_active: schedule.isActive,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newSchedule: IrrigationSchedule = {
        id: data.id,
        name: data.name,
        description: data.description,
        zoneId: data.zone_id,
        deviceId: data.device_id,
        startTime: data.start_time,
        duration: data.duration,
        daysOfWeek: data.days_of_week,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSchedules(prev => [newSchedule, ...prev]);
      toast.success('Irrigation schedule created successfully');
      return newSchedule;
    } catch (err) {
      console.error('Error creating irrigation schedule:', err);
      toast.error('Failed to create irrigation schedule');
      throw err;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<IrrigationSchedule>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .update({
          name: updates.name,
          description: updates.description,
          zone_id: updates.zoneId,
          device_id: updates.deviceId,
          start_time: updates.startTime,
          duration: updates.duration,
          days_of_week: updates.daysOfWeek,
          is_active: updates.isActive
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure only user's schedules can be updated
        .select()
        .single();

      if (error) throw error;

      const updatedSchedule: IrrigationSchedule = {
        id: data.id,
        name: data.name,
        description: data.description,
        zoneId: data.zone_id,
        deviceId: data.device_id,
        startTime: data.start_time,
        duration: data.duration,
        daysOfWeek: data.days_of_week,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSchedules(prev => prev.map(schedule => schedule.id === id ? updatedSchedule : schedule));
      toast.success('Irrigation schedule updated successfully');
      return updatedSchedule;
    } catch (err) {
      console.error('Error updating irrigation schedule:', err);
      toast.error('Failed to update irrigation schedule');
      throw err;
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure only user's schedules can be deleted

      if (error) throw error;

      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast.success('Irrigation schedule deleted successfully');
    } catch (err) {
      console.error('Error deleting irrigation schedule:', err);
      toast.error('Failed to delete irrigation schedule');
      throw err;
    }
  };

  const toggleSchedule = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    try {
      await updateSchedule(id, { isActive: !schedule.isActive });
    } catch (err) {
      console.error('Error toggling schedule:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    refetch: fetchSchedules
  };
};
