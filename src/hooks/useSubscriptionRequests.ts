
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  contact_submission_id?: string;
  plan_id: string;
  approval_status: 'pending' | 'approved' | 'denied';
  approved_by?: string;
  approved_at?: string;
  denial_reason?: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: {
    name: string;
    price: number;
    billing_interval: string;
  };
  contact_submissions?: {
    full_name: string;
    email: string;
    phone_number: string;
  };
}

export const useSubscriptionRequests = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isRoleAdmin, isRoleSuperAdmin } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('subscription_requests')
        .select(`
          *,
          subscription_plans(name, price, billing_interval),
          contact_submissions(full_name, email, phone_number)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only fetch user's own requests
      if (!isRoleAdmin() && !isRoleSuperAdmin()) {
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setRequests(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription requests:', err);
      setError('Failed to load subscription requests');
      toast.error('Failed to load subscription requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscription_requests')
        .update({ 
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              approval_status: 'approved' as const,
              approved_by: user.id,
              approved_at: new Date().toISOString()
            } 
          : request
      ));

      toast.success('Request approved successfully');
      return true;
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error('Failed to approve request');
      return false;
    }
  };

  const denyRequest = async (requestId: string, reason: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscription_requests')
        .update({ 
          approval_status: 'denied',
          approved_by: user.id,
          denial_reason: reason,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              approval_status: 'denied' as const,
              approved_by: user.id,
              denial_reason: reason,
              approved_at: new Date().toISOString()
            } 
          : request
      ));

      toast.success('Request denied');
      return true;
    } catch (err) {
      console.error('Error denying request:', err);
      toast.error('Failed to deny request');
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  return {
    requests,
    loading,
    error,
    approveRequest,
    denyRequest,
    refetch: fetchRequests
  };
};
