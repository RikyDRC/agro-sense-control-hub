
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface AutomationHistory {
  id: string;
  type: 'RULE_TRIGGER' | 'SCHEDULE' | 'MANUAL';
  name: string;
  description: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  zoneId: string;
  deviceId?: string;
  timestamp: string;
  details?: string;
}

export const useAutomationHistory = () => {
  const [history, setHistory] = useState<AutomationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (limit = 50) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedHistory: AutomationHistory[] = data.map(entry => ({
        id: entry.id,
        type: entry.type as 'RULE_TRIGGER' | 'SCHEDULE' | 'MANUAL',
        name: entry.name,
        description: entry.description,
        status: entry.status as 'SUCCESS' | 'FAILURE' | 'PENDING',
        zoneId: entry.zone_id,
        deviceId: entry.device_id,
        timestamp: entry.timestamp,
        details: entry.details
      }));

      setHistory(formattedHistory);
      setError(null);
    } catch (err) {
      console.error('Error fetching automation history:', err);
      setError('Failed to load automation history');
      toast.error('Failed to load automation history');
    } finally {
      setLoading(false);
    }
  };

  const addHistoryEntry = async (entry: Omit<AutomationHistory, 'id' | 'timestamp'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('automation_history')
        .insert({
          type: entry.type,
          name: entry.name,
          description: entry.description,
          status: entry.status,
          zone_id: entry.zoneId,
          device_id: entry.deviceId,
          details: entry.details,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: AutomationHistory = {
        id: data.id,
        type: data.type,
        name: data.name,
        description: data.description,
        status: data.status,
        zoneId: data.zone_id,
        deviceId: data.device_id,
        timestamp: data.timestamp,
        details: data.details
      };

      setHistory(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      console.error('Error adding history entry:', err);
      throw err;
    }
  };

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('automation_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setHistory([]);
      toast.success('History cleared successfully');
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error('Failed to clear history');
      throw err;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    error,
    addHistoryEntry,
    clearHistory,
    refetch: fetchHistory
  };
};
