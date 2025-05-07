
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import PlanList from '@/components/subscription/PlanList';
import PlanForm from '@/components/subscription/PlanForm';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: Record<string, any>;
}

const SubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const { isRoleSuperAdmin, user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;

      // If no plans exist and user is a super admin, create a default plan
      if (data.length === 0 && isRoleSuperAdmin()) {
        await createDefaultPlan();
      } else {
        setPlans(data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlan = async () => {
    try {
      const defaultPlan = {
        name: 'Basic Plan',
        description: 'Entry-level subscription for small farms',
        price: 19.99,
        billing_interval: 'month',
        features: {
          sensors: 5,
          zones: 3,
          alerts: true,
          reports: true,
          automation: false,
          api_access: false
        }
      };

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(defaultPlan)
        .select()
        .single();

      if (error) throw error;

      toast.success('Default subscription plan created');
      setPlans([data]);
    } catch (error) {
      console.error('Error creating default plan:', error);
      toast.error('Failed to create default plan');
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowPlanForm(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowPlanForm(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      setDeletingPlan(planId);
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast.success('Subscription plan deleted');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete subscription plan');
    } finally {
      setDeletingPlan(null);
    }
  };

  const handleSavePlan = async (plan: any) => {
    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update(plan)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Subscription plan updated');
      } else {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert(plan);

        if (error) throw error;
        toast.success('New subscription plan created');
      }

      setShowPlanForm(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save subscription plan');
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }

    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      if (!data.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to set up subscription payment');
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading plans...</p>
          </div>
        ) : showPlanForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Plan'}</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-200px)] md:h-auto">
              <div className="p-6">
                <PlanForm
                  plan={editingPlan}
                  onSubmit={handleSavePlan}
                  onCancel={() => setShowPlanForm(false)}
                />
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <PlanList
            plans={plans}
            subscribing={subscribing}
            deletingPlan={deletingPlan}
            onAddPlan={handleAddPlan}
            onSubscribe={handleSubscribe}
            onEditPlan={handleEditPlan}
            onDeletePlan={handleDeletePlan}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
