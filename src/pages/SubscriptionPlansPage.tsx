import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import PlanList from '@/components/subscription/PlanList';
import PlanForm from '@/components/subscription/PlanForm';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_interval: 'month',
    features: {} as Record<string, any>,
    id: undefined as string | undefined
  });
  const [savingPlan, setSavingPlan] = useState(false);
  
  const { isRoleSuperAdmin, user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (editingPlan) {
      setPlanFormData({
        name: editingPlan.name,
        description: editingPlan.description || '',
        price: editingPlan.price.toString(),
        billing_interval: editingPlan.billing_interval,
        features: typeof editingPlan.features === 'object' ? 
          editingPlan.features : 
          JSON.parse(editingPlan.features || '{}'),
        id: editingPlan.id
      });
    } else {
      setPlanFormData({
        name: '',
        description: '',
        price: '',
        billing_interval: 'month',
        features: {},
        id: undefined
      });
    }
  }, [editingPlan]);

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
        // Parse JSON features if stored as string
        const processedPlans = data.map(plan => ({
          ...plan,
          features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
        }));
        setPlans(processedPlans || []);
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
      setPlans([{
        ...data,
        features: typeof data.features === 'string' ? JSON.parse(data.features) : data.features
      }]);
    } catch (error) {
      console.error('Error creating default plan:', error);
      toast.error('Failed to create default plan');
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowPlanForm(true);
  };

  const handleEditPlan = (plan: any) => {
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

  const handleFormDataChange = (field: string, value: any) => {
    setPlanFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSavingPlan(true);
      const planData = {
        name: planFormData.name,
        description: planFormData.description,
        price: parseFloat(planFormData.price),
        billing_interval: planFormData.billing_interval,
        features: planFormData.features
      };

      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Subscription plan updated');
      } else {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert(planData);

        if (error) throw error;
        toast.success('New subscription plan created');
      }

      setShowPlanForm(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save subscription plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }

    // Check if user already has an active subscription
    if (subscription && subscription.status === 'active') {
      toast.error('You already have an active subscription');
      return;
    }

    // Find the selected plan
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      toast.error('Selected plan not found');
      return;
    }

    setSubscribing(true);
    
    try {
      // For free tier, redirect to contact form (will be auto-approved)
      if (selectedPlan.name === 'Free Tier' || selectedPlan.price === 0) {
        navigate(`/contact?planId=${planId}`);
        return;
      }

      // For paid plans, redirect to contact form for approval process
      navigate(`/contact?planId=${planId}`);
    } catch (error) {
      console.error('Error with subscription process:', error);
      toast.error('Failed to process subscription request');
    } finally {
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
                  planFormData={planFormData}
                  isEditing={!!editingPlan}
                  savingPlan={savingPlan}
                  onCancel={() => setShowPlanForm(false)}
                  onSave={handleSavePlan}
                  onFormDataChange={handleFormDataChange}
                  onFeatureChange={handleFeatureChange}
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
