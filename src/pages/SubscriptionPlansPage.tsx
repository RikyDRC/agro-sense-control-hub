
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: Record<string, any>;
}

const SubscriptionPlansPage: React.FC = () => {
  const { user, profile, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Convert the features from Json to Record<string, any>
      const formattedPlans = data?.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : plan.features
      })) as SubscriptionPlan[];
      
      setPlans(formattedPlans || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate checkout');
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'month' ? 'mo' : 'yr'}`;
  };

  const isPlanActive = (planId: string) => {
    return subscription?.plan?.id === planId;
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
      } else if (typeof value === 'number') {
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-agro-green" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose the plan that best fits your farming needs
          </p>
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
            <Button
              variant="outline"
              className="mt-2"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('customer-portal');
                  if (error) throw error;
                  if (data?.url) {
                    window.location.href = data.url;
                  }
                } catch (error) {
                  console.error('Error opening customer portal:', error);
                  toast.error('Failed to open subscription management');
                }
              }}
            >
              Manage Subscription
            </Button>
          </Alert>
        )}

        {profile?.role !== 'farmer' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin Notice</AlertTitle>
            <AlertDescription>
              As an {profile?.role.replace('_', ' ')}, you don't need a subscription plan to access all features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`
                relative overflow-hidden
                ${isPlanActive(plan.id) ? 'border-agro-green border-2' : ''}
              `}
            >
              {isPlanActive(plan.id) && (
                <div className="absolute top-0 right-0">
                  <Badge className="m-2 bg-agro-green">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatPrice(plan.price, plan.billing_interval)}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {renderFeaturesList(plan.features)}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isPlanActive(plan.id) ? "outline" : "default"}
                  disabled={subscribing || (profile?.role !== 'farmer') || isPlanActive(plan.id)}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isPlanActive(plan.id) ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPlansPage;
