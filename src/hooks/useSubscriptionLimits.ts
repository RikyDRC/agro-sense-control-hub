
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface SubscriptionLimits {
  maxZones: number;
  maxDevices: number;
  maxCrops: number;
  hasAdvancedFeatures: boolean;
  hasAutomation: boolean;
  hasWeatherAPI: boolean;
  hasMapsAPI: boolean;
}

export const useSubscriptionLimits = () => {
  const { subscription, profile, isRoleAdmin, isRoleSuperAdmin } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits>({
    maxZones: 0,
    maxDevices: 0,
    maxCrops: 0,
    hasAdvancedFeatures: false,
    hasAutomation: false,
    hasWeatherAPI: false,
    hasMapsAPI: false,
  });

  useEffect(() => {
    // Admin and Super Admin users have unlimited access
    if (profile && (isRoleAdmin() || isRoleSuperAdmin())) {
      setLimits({
        maxZones: Infinity,
        maxDevices: Infinity,
        maxCrops: Infinity,
        hasAdvancedFeatures: true,
        hasAutomation: true,
        hasWeatherAPI: true,
        hasMapsAPI: true,
      });
      return;
    }

    // Set limits based on subscription plan
    if (subscription?.plan?.features) {
      const features = subscription.plan.features;
      setLimits({
        maxZones: features.max_zones || 0,
        maxDevices: features.max_devices || 0,
        maxCrops: features.max_crops || 0,
        hasAdvancedFeatures: features.advanced_features || false,
        hasAutomation: features.automation || false,
        hasWeatherAPI: features.weather_api || true, // All users can access shared weather API
        hasMapsAPI: features.maps_api || true, // All users can access shared maps API
      });
    } else {
      // No subscription - free tier or no plan
      setLimits({
        maxZones: 1,
        maxDevices: 2,
        maxCrops: 1,
        hasAdvancedFeatures: false,
        hasAutomation: false,
        hasWeatherAPI: true, // Shared platform API
        hasMapsAPI: true, // Shared platform API
      });
    }
  }, [subscription, profile, isRoleAdmin, isRoleSuperAdmin]);

  const checkLimit = (type: 'zones' | 'devices' | 'crops', currentCount: number): boolean => {
    const maxCount = type === 'zones' ? limits.maxZones : 
                    type === 'devices' ? limits.maxDevices : limits.maxCrops;
    
    if (maxCount === Infinity) return true;
    
    if (currentCount >= maxCount) {
      toast.error(`You've reached the limit of ${maxCount} ${type} for your current plan. Please upgrade to add more.`);
      return false;
    }
    
    return true;
  };

  const canUseFeature = (feature: 'automation' | 'advanced' | 'weather' | 'maps'): boolean => {
    switch (feature) {
      case 'automation':
        return limits.hasAutomation;
      case 'advanced':
        return limits.hasAdvancedFeatures;
      case 'weather':
        return limits.hasWeatherAPI;
      case 'maps':
        return limits.hasMapsAPI;
      default:
        return false;
    }
  };

  return {
    limits,
    checkLimit,
    canUseFeature,
  };
};
