
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NewsletterSubscription {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNewsletterSubscriptions = () => {
  return useQuery({
    queryKey: ['newsletter-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NewsletterSubscription[];
    },
  });
};

export const useCreateNewsletterSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Thank you for subscribing to our newsletter!',
      });
    },
    onError: (error: any) => {
      const message = error?.message?.includes('duplicate') 
        ? 'You are already subscribed to our newsletter.'
        : 'Failed to subscribe. Please try again.';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      console.error('Error creating newsletter subscription:', error);
    },
  });
};
