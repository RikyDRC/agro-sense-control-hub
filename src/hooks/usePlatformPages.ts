
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlatformPage {
  id: string;
  slug: string;
  title: string;
  content: any;
  meta_description?: string;
  is_published: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export const usePlatformPages = () => {
  return useQuery({
    queryKey: ['platform-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_pages')
        .select('*')
        .order('slug');
      
      if (error) throw error;
      return data as PlatformPage[];
    },
  });
};

export const usePlatformPage = (slug: string) => {
  return useQuery({
    queryKey: ['platform-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as PlatformPage;
    },
  });
};

export const useCreatePlatformPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pageData: Omit<PlatformPage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('platform_pages')
        .insert([pageData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-pages'] });
      toast({
        title: 'Success',
        description: 'Platform page created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create platform page',
        variant: 'destructive',
      });
      console.error('Error creating platform page:', error);
    },
  });
};

export const useUpdatePlatformPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlatformPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('platform_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-pages'] });
      queryClient.invalidateQueries({ queryKey: ['platform-page', data.slug] });
      toast({
        title: 'Success',
        description: 'Platform page updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update platform page',
        variant: 'destructive',
      });
      console.error('Error updating platform page:', error);
    },
  });
};

export const useDeletePlatformPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-pages'] });
      toast({
        title: 'Success',
        description: 'Platform page deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete platform page',
        variant: 'destructive',
      });
      console.error('Error deleting platform page:', error);
    },
  });
};
