
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
import { Info, Check, AlertTriangle, Loader2, Plus, Edit, Trash, Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: Record<string, any>;
}

interface PlanFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  billing_interval: string;
  features: Record<string, any>;
}

const SubscriptionPlansPage: React.FC = () => {
  const { user, profile, subscription, refreshSubscription, isRoleSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [planFormData, setPlanFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: '0',
    billing_interval: 'month',
    features: {}
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      // Fetch the subscription plans from the database
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
        return;
      }
      
      // If no plans exist, create default ones
      if (!data || data.length === 0) {
        console.log('No subscription plans found, creating default plans');
        await createDefaultPlans();
        return;
      }
      
      // Convert the features from JSON to Record<string, any>
      const formattedPlans = data?.map(plan => ({
        ...plan,
        features: typeof plan.features === 'string' 
          ? JSON.parse(plan.features) 
          : plan.features
      })) as SubscriptionPlan[];
      
      setPlans(formattedPlans || []);
    } catch (error) {
      console.error('Error in fetchPlans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlans = async () => {
    try {
      // Define default subscription plans
      const defaultPlans = [
        {
          name: 'Basic',
          description: 'For small farms and personal use',
          price: 9.99,
          billing_interval: 'month',
          features: {
            "basic_analytics": true,
            "irrigation_control": true,
            "weather_data": true,
            "sensor_limit": 5,
            "zone_limit": 3
          }
        },
        {
          name: 'Pro',
          description: 'For medium-sized farms with advanced needs',
          price: 29.99,
          billing_interval: 'month',
          features: {
            "basic_analytics": true,
            "advanced_analytics": true,
            "irrigation_control": true,
            "weather_data": true,
            "soil_analysis": true,
            "sensor_limit": 20,
            "zone_limit": 10
          }
        },
        {
          name: 'Enterprise',
          description: 'For large agricultural operations',
          price: 99.99,
          billing_interval: 'month',
          features: {
            "basic_analytics": true,
            "advanced_analytics": true,
            "predictive_analytics": true,
            "irrigation_control": true,
            "weather_data": true,
            "soil_analysis": true,
            "crop_recommendations": true,
            "sensor_limit": 100,
            "zone_limit": 50,
            "priority_support": true
          }
        }
      ];
      
      // Insert the default plans into the database
      for (const plan of defaultPlans) {
        const { error } = await supabase
          .from('subscription_plans')
          .insert(plan);
          
        if (error) {
          console.error('Error creating default plan:', error);
        }
      }
      
      // Fetch the plans again after creating default ones
      fetchPlans();
      toast.success('Default subscription plans created');
    } catch (error) {
      console.error('Error creating default plans:', error);
      toast.error('Failed to create default subscription plans');
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

  const handleAddPlan = () => {
    setPlanFormData({
      name: '',
      description: '',
      price: '0',
      billing_interval: 'month',
      features: {
        basic_analytics: false,
        advanced_analytics: false,
        irrigation_control: false,
        weather_data: false,
        soil_analysis: false,
        sensor_limit: 0,
        zone_limit: 0
      }
    });
    setIsEditing(false);
    setShowPlanDialog(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setPlanFormData({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      billing_interval: plan.billing_interval,
      features: plan.features
    });
    setIsEditing(true);
    setShowPlanDialog(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!isRoleSuperAdmin()) {
      toast.error('Only super admins can delete plans');
      return;
    }

    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      setDeletingPlan(planId);
      try {
        const { error } = await supabase
          .from('subscription_plans')
          .delete()
          .eq('id', planId);

        if (error) {
          throw error;
        }

        toast.success('Plan deleted successfully');
        fetchPlans();
      } catch (error: any) {
        console.error('Error deleting plan:', error);
        toast.error(error.message || 'Failed to delete plan');
      } finally {
        setDeletingPlan(null);
      }
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRoleSuperAdmin()) {
      toast.error('Only super admins can manage plans');
      return;
    }

    setSavingPlan(true);
    
    try {
      const planData = {
        name: planFormData.name,
        description: planFormData.description,
        price: parseFloat(planFormData.price),
        billing_interval: planFormData.billing_interval,
        features: planFormData.features
      };
      
      let error;
      
      if (isEditing && planFormData.id) {
        // Update existing plan
        const response = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', planFormData.id);
          
        error = response.error;
      } else {
        // Create new plan
        const response = await supabase
          .from('subscription_plans')
          .insert(planData);
          
        error = response.error;
      }
      
      if (error) {
        throw error;
      }
      
      toast.success(isEditing ? 'Plan updated successfully' : 'Plan created successfully');
      setShowPlanDialog(false);
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(error.message || 'Failed to save plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleFeatureChange = (key: string, value: any) => {
    setPlanFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Choose the plan that best fits your farming needs
            </p>
          </div>
          
          {isRoleSuperAdmin() && (
            <Button onClick={handleAddPlan}>
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
              {isRoleSuperAdmin() && " You can manage all plans and assign them to users."}
            </AlertDescription>
          </Alert>
        )}

        {plans.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Subscription Plans Available</AlertTitle>
            <AlertDescription>
              There are currently no subscription plans available. Please check back later or contact support.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2"
                onClick={createDefaultPlans}
              >
                Create default plans
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
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
                
                <CardFooter className="flex justify-between">
                  <div>
                    {isRoleSuperAdmin() && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={deletingPlan === plan.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          {deletingPlan === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button 
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
        )}
      </div>

      {/* Plan Add/Edit Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the subscription plan details' 
                : 'Create a new subscription plan for users'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input 
                id="name" 
                value={planFormData.name} 
                onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={planFormData.description} 
                onChange={(e) => setPlanFormData({...planFormData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={planFormData.price} 
                  onChange={(e) => setPlanFormData({...planFormData, price: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_interval">Billing Interval</Label>
                <Select 
                  value={planFormData.billing_interval} 
                  onValueChange={(value) => setPlanFormData({...planFormData, billing_interval: value})}
                >
                  <SelectTrigger id="billing_interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Features</Label>
              
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Toggle Features</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['basic_analytics', 'advanced_analytics', 'irrigation_control', 'weather_data', 'soil_analysis', 'crop_recommendations', 'priority_support'].map((feature) => (
                      <div key={feature} className="flex items-center justify-between">
                        <Label htmlFor={feature} className="cursor-pointer">
                          {feature.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <input
                          id={feature}
                          type="checkbox"
                          checked={!!planFormData.features[feature]}
                          onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                          className="h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-normal">Numeric Limits</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sensor_limit">Sensor Limit</Label>
                      <Input
                        id="sensor_limit"
                        type="number"
                        min="0"
                        value={planFormData.features.sensor_limit || 0}
                        onChange={(e) => handleFeatureChange('sensor_limit', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone_limit">Zone Limit</Label>
                      <Input
                        id="zone_limit"
                        type="number"
                        min="0"
                        value={planFormData.features.zone_limit || 0}
                        onChange={(e) => handleFeatureChange('zone_limit', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPlanDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingPlan}>
                {savingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubscriptionPlansPage;
