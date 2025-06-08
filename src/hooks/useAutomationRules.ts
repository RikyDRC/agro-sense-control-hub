
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule, RuleCondition, RuleAction } from '@/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useAutomationRules = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    if (!user) {
      setRules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id) // Ensure only user's automation rules are fetched
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRules: AutomationRule[] = data.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        condition: rule.condition as RuleCondition,
        action: rule.action as RuleAction,
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
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          name: rule.name,
          description: rule.description,
          condition: rule.condition as any,
          action: rule.action as any,
          zone_id: rule.zoneId,
          is_active: rule.isActive,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newRule: AutomationRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        condition: data.condition as RuleCondition,
        action: data.action as RuleAction,
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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({
          name: updates.name,
          description: updates.description,
          condition: updates.condition as any,
          action: updates.action as any,
          zone_id: updates.zoneId,
          is_active: updates.isActive
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure only user's rules can be updated
        .select()
        .single();

      if (error) throw error;

      const updatedRule: AutomationRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        condition: data.condition as RuleCondition,
        action: data.action as RuleAction,
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure only user's rules can be deleted

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
  }, [user]);

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
