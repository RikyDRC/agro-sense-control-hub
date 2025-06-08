
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface PlatformConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
}

export const usePlatformConfig = () => {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isRoleAdmin, isRoleSuperAdmin } = useAuth();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigs(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching platform configs:', err);
      setError('Failed to load platform configurations');
      toast.error('Failed to load platform configurations');
    } finally {
      setLoading(false);
    }
  };

  const getConfig = (key: string): string | null => {
    const config = configs.find(c => c.key === key);
    return config?.value || null;
  };

  const setConfig = async (key: string, value: string, description?: string): Promise<boolean> => {
    if (!isRoleAdmin() && !isRoleSuperAdmin()) {
      toast.error('Only administrators can modify platform configurations');
      return false;
    }

    try {
      const { error } = await supabase
        .from('platform_config')
        .upsert({
          key,
          value,
          description,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      await fetchConfigs(); // Refresh configs
      toast.success('Configuration updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating platform config:', err);
      toast.error('Failed to update configuration');
      return false;
    }
  };

  const deleteConfig = async (key: string): Promise<boolean> => {
    if (!isRoleAdmin() && !isRoleSuperAdmin()) {
      toast.error('Only administrators can delete platform configurations');
      return false;
    }

    try {
      const { error } = await supabase
        .from('platform_config')
        .delete()
        .eq('key', key);

      if (error) throw error;

      await fetchConfigs(); // Refresh configs
      toast.success('Configuration deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting platform config:', err);
      toast.error('Failed to delete configuration');
      return false;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return {
    configs,
    loading,
    error,
    getConfig,
    setConfig,
    deleteConfig,
    refetch: fetchConfigs,
    canManage: isRoleAdmin() || isRoleSuperAdmin()
  };
};
