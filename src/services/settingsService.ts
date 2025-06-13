
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface UserSettings {
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    alertThreshold: number;
  };
  preferences: {
    measurementUnit: 'metric' | 'imperial';
    timeZone: string;
    darkMode: boolean;
  };
  dataManagement: {
    retentionPeriod: number;
  };
}

export const defaultSettings: UserSettings = {
  notifications: {
    enabled: true,
    email: true,
    push: false,
    alertThreshold: 15,
  },
  preferences: {
    measurementUnit: 'metric',
    timeZone: 'America/Los_Angeles',
    darkMode: false,
  },
  dataManagement: {
    retentionPeriod: 90,
  },
};

export const settingsService = {
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('key, value')
        .eq('key', `user_settings_${userId}`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        return JSON.parse(data.value);
      }

      return defaultSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return defaultSettings;
    }
  },

  async saveUserSettings(userId: string, settings: UserSettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('platform_config')
        .upsert({
          key: `user_settings_${userId}`,
          value: JSON.stringify(settings),
          description: 'User settings and preferences',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
      
      toast.success('Settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast.error('Failed to save settings');
      return false;
    }
  },

  async generateApiKey(userId: string): Promise<string | null> {
    try {
      const newApiKey = `ak_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('device_api_keys')
        .upsert({
          user_id: userId,
          name: 'Primary API Key',
          key: newApiKey,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      toast.success('API key generated successfully');
      return newApiKey;
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key');
      return null;
    }
  },

  async getUserApiKey(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('device_api_keys')
        .select('key')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.key || null;
    } catch (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
  },
};
