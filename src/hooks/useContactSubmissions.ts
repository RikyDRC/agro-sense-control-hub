
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface ContactSubmission {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  additional_notes?: string;
  selected_plan_id?: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
  subscription_plans?: {
    name: string;
    price: number;
    billing_interval: string;
  };
}

export const useContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isRoleAdmin, isRoleSuperAdmin } = useAuth();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contact_submissions')
        .select(`
          *,
          subscription_plans(name, price, billing_interval)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only fetch user's own submissions
      if (!isRoleAdmin() && !isRoleSuperAdmin()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Type assertion to ensure correct typing
      setSubmissions((data as any[])?.map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'denied'
      })) || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching contact submissions:', err);
      setError('Failed to load contact submissions');
      toast.error('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'denied') => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', submissionId);

      if (error) throw error;

      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId ? { ...submission, status } : submission
      ));

      toast.success(`Submission ${status} successfully`);
      return true;
    } catch (err) {
      console.error('Error updating submission status:', err);
      toast.error('Failed to update submission status');
      return false;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    error,
    updateSubmissionStatus,
    refetch: fetchSubmissions
  };
};
