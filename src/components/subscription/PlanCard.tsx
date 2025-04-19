
import React from 'react';
import { Edit, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PlanFeature {
  key: string;
  value: boolean | number;
}

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
  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  const renderFeaturesList = (features: Record<string, any>) => {
    return Object.entries(features).map(([key, value]) => {
      if (typeof value === 'boolean' && value) {
        return (
          <div key={key} className="flex items-center py-1">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <span>{key.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
        );
      } else if (typeof value === 'number' && value > 0) {
        return (
          <div key={key} className="flex items-center py-1">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <span>{`${value} ${key.split('_').join(' ')}`}</span>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
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
        <Button 
          variant={isActive ? "outline" : "default"}
          disabled={isSubscribing || !canManagePlans || isActive}
          onClick={() => onSubscribe(id)}
        >
          {isSubscribing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isActive ? (
            'Current Plan'
          ) : (
            'Subscribe'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
