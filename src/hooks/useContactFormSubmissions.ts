
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useContactFormSubmissions = () => {
  return useQuery({
    queryKey: ['contact-form-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactFormSubmission[];
    },
  });
};

export const useCreateContactFormSubmission = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: Omit<ContactFormSubmission, 'id' | 'is_read' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your message has been sent successfully. We\'ll get back to you soon!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send your message. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating contact form submission:', error);
    },
  });
};

export const useUpdateContactFormSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactFormSubmission> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-form-submissions'] });
      toast({
        title: 'Success',
        description: 'Contact submission updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update contact submission',
        variant: 'destructive',
      });
      console.error('Error updating contact submission:', error);
    },
  });
};
