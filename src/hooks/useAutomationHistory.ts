
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [history, setHistory] = useState<AutomationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (limit = 50) => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_history')
        .select('*')
        .eq('user_id', user.id) // Ensure only user's automation history is fetched
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
    if (!user) throw new Error('User not authenticated');

    try {
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
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: AutomationHistory = {
        id: data.id,
        type: data.type as 'RULE_TRIGGER' | 'SCHEDULE' | 'MANUAL',
        name: data.name,
        description: data.description,
        status: data.status as 'SUCCESS' | 'FAILURE' | 'PENDING',
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('automation_history')
        .delete()
        .eq('user_id', user.id); // Only clear current user's history

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
  }, [user]);

  return {
    history,
    loading,
    error,
    addHistoryEntry,
    clearHistory,
    refetch: fetchHistory
  };
};
