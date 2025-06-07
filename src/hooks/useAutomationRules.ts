
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule } from '@/types';
import { toast } from '@/components/ui/sonner';

export const useAutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRules: AutomationRule[] = data.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        condition: rule.condition,
        action: rule.action,
        zoneId: rule.zone_id,
        isActive: rule.is_active,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      }));

      setRules(formattedRules);
      setError(null);
    } catch (err) {
      console.error('Error fetching automation rules:', err);
      setError('Failed to load automation rules');
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          condition: rule.condition,
          action: rule.action,
          zone_id: rule.zoneId,
          is_active: rule.isActive,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newRule: AutomationRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        condition: data.condition,
        action: data.action,
        zoneId: data.zone_id,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRules(prev => [newRule, ...prev]);
      toast.success('Automation rule created successfully');
      return newRule;
    } catch (err) {
      console.error('Error creating automation rule:', err);
      toast.error('Failed to create automation rule');
      throw err;
    }
  };

  const updateRule = async (id: string, updates: Partial<AutomationRule>) => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({
          name: updates.name,
          description: updates.description,
          condition: updates.condition,
          action: updates.action,
          zone_id: updates.zoneId,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRule: AutomationRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        condition: data.condition,
        action: data.action,
        zoneId: data.zone_id,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setRules(prev => prev.map(rule => rule.id === id ? updatedRule : rule));
      toast.success('Automation rule updated successfully');
      return updatedRule;
    } catch (err) {
      console.error('Error updating automation rule:', err);
      toast.error('Failed to update automation rule');
      throw err;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== id));
      toast.success('Automation rule deleted successfully');
    } catch (err) {
      console.error('Error deleting automation rule:', err);
      toast.error('Failed to delete automation rule');
      throw err;
    }
  };

  const toggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;

    try {
      await updateRule(id, { isActive: !rule.isActive });
    } catch (err) {
      console.error('Error toggling rule:', err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return {
    rules,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules
  };
};
