
import React from 'react';
import { Edit, Trash, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface PlanCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingInterval: string;
  features: Record<string, any>;
  isActive: boolean;
  isSubscribing: boolean;
  canManagePlans: boolean;
  deletingPlanId: string | null;
  onSubscribe: (planId: string) => void;
  onEdit: (plan: any) => void;
  onDelete: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  id,
  name,
  description,
  price,
  billingInterval,
  features,
  isActive,
  isSubscribing,
  canManagePlans,
  deletingPlanId,
  onSubscribe,
  onEdit,
  onDelete,
}) => {
  const { isRoleAdmin, isRoleSuperAdmin } = useAuth();
  
  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  const renderFeaturesList = (features: Record<string, any>) => {
    const featureItems = [];
    
    // Show key limits first
    if (features.max_zones) {
      featureItems.push(
        <div key="zones" className="flex items-center py-1">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>{features.max_zones === -1 ? 'Unlimited' : features.max_zones} Zones</span>
        </div>
      );
    }
    
    if (features.max_devices) {
      featureItems.push(
        <div key="devices" className="flex items-center py-1">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>{features.max_devices === -1 ? 'Unlimited' : features.max_devices} Devices</span>
        </div>
      );
    }
    
    if (features.max_crops) {
      featureItems.push(
        <div key="crops" className="flex items-center py-1">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <span>{features.max_crops === -1 ? 'Unlimited' : features.max_crops} Crops</span>
        </div>
      );
    }

    // Show boolean features
    Object.entries(features).forEach(([key, value]) => {
      if (typeof value === 'boolean' && value && !key.startsWith('max_')) {
        const displayName = key.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        featureItems.push(
          <div key={key} className="flex items-center py-1">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <span>{displayName}</span>
          </div>
        );
      }
    });

    // Always show shared platform features for all plans
    featureItems.push(
      <div key="shared-weather" className="flex items-center py-1">
        <Check className="h-4 w-4 mr-2 text-blue-500" />
        <span>Weather API (Shared)</span>
      </div>
    );
    
    featureItems.push(
      <div key="shared-maps" className="flex items-center py-1">
        <Check className="h-4 w-4 mr-2 text-blue-500" />
        <span>Google Maps (Shared)</span>
      </div>
    );

    return featureItems;
  };

  const shouldShowSubscribeButton = () => {
    // Show subscribe button for non-admins or if user is admin but can manage plans
    return !isActive && (!isRoleAdmin() && !isRoleSuperAdmin() || canManagePlans);
  };

  return (
    <Card className={`relative overflow-hidden ${isActive ? 'border-agro-green border-2' : ''}`}>
      {isActive && (
        <div className="absolute top-0 right-0">
          <Badge className="m-2 bg-agro-green">Current Plan</Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2">
          <span className="text-3xl font-bold">{formatPrice(price, billingInterval)}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <Separator className="mb-4" />
        <div className="space-y-2">
          {renderFeaturesList(features)}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {canManagePlans && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit({
                  id,
                  name,
                  description,
                  price,
                  billing_interval: billingInterval,
                  features
                })}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(id)}
                disabled={deletingPlanId === id}
                className="text-red-500 hover:text-red-700"
              >
                {deletingPlanId === id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        {shouldShowSubscribeButton() && (
          <Button 
            variant="default"
            disabled={isSubscribing}
            onClick={() => onSubscribe(id)}
          >
            {isSubscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
        )}
        
        {isActive && (
          <Button variant="outline" disabled>
            Current Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
