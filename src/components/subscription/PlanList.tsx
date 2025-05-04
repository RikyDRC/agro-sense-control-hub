
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import PlanCard from './PlanCard';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: Record<string, any>;
}

interface PlanListProps {
  plans: SubscriptionPlan[];
  subscribing: boolean;
  deletingPlan: string | null;
  onAddPlan: () => void;
  onSubscribe: (planId: string) => void;
  onEditPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (planId: string) => void;
}

const PlanList: React.FC<PlanListProps> = ({
  plans,
  subscribing,
  deletingPlan,
  onAddPlan,
  onSubscribe,
  onEditPlan,
  onDeletePlan,
}) => {
  const { profile, subscription, isRoleSuperAdmin } = useAuth();
  
  // Get user role with fallback for when profile is not available
  const getUserRole = () => {
    if (profile) {
      return profile.role;
    }
    // Default to farmer if we can't determine the role
    return 'farmer';
  };

  // We now have a more robust function to determine admin status
  const isAdmin = () => {
    const role = getUserRole();
    return role === 'admin' || role === 'super_admin';
  };

  if (plans.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Subscription Plans Available</AlertTitle>
        <AlertDescription>
          There are currently no subscription plans available. Please check back later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose the plan that best fits your farming needs
          </p>
        </div>
        
        {isRoleSuperAdmin() && (
          <Button onClick={onAddPlan}>
            <Plus className="mr-2 h-4 w-4" /> Add New Plan
          </Button>
        )}
      </div>

      {subscription && (
        <Alert className="bg-agro-green-light/20 border-agro-green">
          <Info className="h-4 w-4 text-agro-green" />
          <AlertTitle>Current Subscription</AlertTitle>
          <AlertDescription>
            You are currently on the {subscription.plan?.name} plan. 
            {subscription.end_date && (
              <span> Your subscription renews on {new Date(subscription.end_date).toLocaleDateString()}.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isAdmin() && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Admin Notice</AlertTitle>
          <AlertDescription>
            As an {getUserRole().replace('_', ' ')}, you don't need a subscription plan to access all features.
            {isRoleSuperAdmin() && " You can manage all plans and assign them to users."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            billingInterval={plan.billing_interval}
            isActive={subscription?.plan?.id === plan.id}
            isSubscribing={subscribing}
            canManagePlans={getUserRole() === 'farmer'} // Only farmers need subscriptions
            deletingPlanId={deletingPlan}
            onSubscribe={onSubscribe}
            onEdit={onEditPlan}
            onDelete={onDeletePlan}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanList;
