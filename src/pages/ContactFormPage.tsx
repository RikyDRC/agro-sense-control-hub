
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const ContactFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: user?.email || '',
    additionalNotes: ''
  });

  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    if (!planId) {
      toast.error('No subscription plan selected');
      navigate('/subscription/plans');
      return;
    }

    fetchPlan();
  }, [user, planId, navigate]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Failed to load subscription plan');
      navigate('/subscription/plans');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !planId) return;

    // Validate required fields
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create contact submission
      const { data: contactSubmission, error: contactError } = await supabase
        .from('contact_submissions')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          additional_notes: formData.additionalNotes,
          selected_plan_id: planId,
          status: 'pending'
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // Create subscription request
      const { error: requestError } = await supabase
        .from('subscription_requests')
        .insert({
          user_id: user.id,
          contact_submission_id: contactSubmission.id,
          plan_id: planId,
          approval_status: 'pending'
        });

      if (requestError) throw requestError;

      // Check if this is free tier (will be auto-approved)
      if (plan?.name === 'Free Tier') {
        toast.success('Welcome! Your free tier access has been activated.');
        navigate('/dashboard');
      } else {
        toast.success('Thank you! We\'ll contact you shortly and approve your request.');
        navigate('/subscription/pending');
      }

    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Registration</CardTitle>
            <CardDescription>
              You've selected the <strong>{plan.name}</strong> plan (${plan.price}/{plan.billing_interval}). 
              Please provide your contact information to complete the process.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information or questions..."
                  rows={4}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Plan: {plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                <p className="font-semibold">${plan.price}/{plan.billing_interval}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/subscription/plans')}
                disabled={loading}
              >
                Back to Plans
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ContactFormPage;
