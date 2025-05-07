
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { supabase } from '@/integrations/supabase/client';

// Form schemas for each payment gateway
const stripeSchema = z.object({
  enabled: z.boolean().default(false),
  test_mode: z.boolean().default(true),
  publishable_key: z.string().min(1, "Publishable key is required"),
  secret_key: z.string().min(1, "Secret key is required"),
});

const paypalSchema = z.object({
  enabled: z.boolean().default(false),
  test_mode: z.boolean().default(true),
  client_id: z.string().min(1, "Client ID is required"),
  secret: z.string().min(1, "Secret is required"),
});

const twoCheckoutSchema = z.object({
  enabled: z.boolean().default(false),
  test_mode: z.boolean().default(true),
  merchant_code: z.string().min(1, "Merchant code is required"),
  secret_key: z.string().min(1, "Secret key is required"),
});

const PaymentGatewaysConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stripe');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Initialize forms
  const stripeForm = useForm<z.infer<typeof stripeSchema>>({
    resolver: zodResolver(stripeSchema),
    defaultValues: {
      enabled: false,
      test_mode: true,
      publishable_key: '',
      secret_key: '',
    },
  });
  
  const paypalForm = useForm<z.infer<typeof paypalSchema>>({
    resolver: zodResolver(paypalSchema),
    defaultValues: {
      enabled: false,
      test_mode: true,
      client_id: '',
      secret: '',
    },
  });
  
  const twoCheckoutForm = useForm<z.infer<typeof twoCheckoutSchema>>({
    resolver: zodResolver(twoCheckoutSchema),
    defaultValues: {
      enabled: false,
      test_mode: true,
      merchant_code: '',
      secret_key: '',
    },
  });

  useEffect(() => {
    fetchPaymentConfigs();
  }, []);
  
  const fetchPaymentConfigs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .eq('key', 'payment_gateways');
      
      if (error) {
        console.error('Error fetching payment configs:', error);
        toast.error('Failed to load payment gateway configurations');
        return;
      }
      
      if (data && data.length > 0) {
        const config = JSON.parse(data[0].value);
        
        // Populate Stripe form
        if (config.stripe) {
          stripeForm.reset({
            enabled: config.stripe.enabled || false,
            test_mode: config.stripe.test_mode !== false, // Default to test mode if not specified
            publishable_key: config.stripe.publishable_key || '',
            secret_key: config.stripe.secret_key || '',
          });
        }
        
        // Populate PayPal form
        if (config.paypal) {
          paypalForm.reset({
            enabled: config.paypal.enabled || false,
            test_mode: config.paypal.test_mode !== false,
            client_id: config.paypal.client_id || '',
            secret: config.paypal.secret || '',
          });
        }
        
        // Populate 2Checkout form
        if (config.twoCheckout) {
          twoCheckoutForm.reset({
            enabled: config.twoCheckout.enabled || false,
            test_mode: config.twoCheckout.test_mode !== false,
            merchant_code: config.twoCheckout.merchant_code || '',
            secret_key: config.twoCheckout.secret_key || '',
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchPaymentConfigs:', err);
      toast.error('An error occurred while loading payment configurations');
    } finally {
      setLoading(false);
    }
  };
  
  const saveStripeConfig = async (values: z.infer<typeof stripeSchema>) => {
    try {
      setSaving(true);
      await savePaymentConfig('stripe', values);
      toast.success('Stripe configuration saved successfully');
    } catch (err) {
      console.error('Error saving Stripe config:', err);
      toast.error('Failed to save Stripe configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const savePaypalConfig = async (values: z.infer<typeof paypalSchema>) => {
    try {
      setSaving(true);
      await savePaymentConfig('paypal', values);
      toast.success('PayPal configuration saved successfully');
    } catch (err) {
      console.error('Error saving PayPal config:', err);
      toast.error('Failed to save PayPal configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const saveTwoCheckoutConfig = async (values: z.infer<typeof twoCheckoutSchema>) => {
    try {
      setSaving(true);
      await savePaymentConfig('twoCheckout', values);
      toast.success('2Checkout configuration saved successfully');
    } catch (err) {
      console.error('Error saving 2Checkout config:', err);
      toast.error('Failed to save 2Checkout configuration');
    } finally {
      setSaving(false);
    }
  };
  
  const savePaymentConfig = async (provider: string, config: any) => {
    // Get existing config
    const { data, error } = await supabase
      .from('platform_config')
      .select('*')
      .eq('key', 'payment_gateways')
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no data found
      console.error('Error fetching existing config:', error);
      throw new Error('Failed to fetch existing configuration');
    }
    
    let existingConfig: Record<string, any> = {};
    if (data) {
      try {
        existingConfig = JSON.parse(data.value);
      } catch (e) {
        console.error('Error parsing existing config:', e);
        existingConfig = {};
      }
    }
    
    // Update the specific provider's config
    existingConfig[provider] = config;
    
    // Save the updated config
    if (data) {
      const { error: updateError } = await supabase
        .from('platform_config')
        .update({
          value: JSON.stringify(existingConfig),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating config:', updateError);
        throw new Error('Failed to update configuration');
      }
    } else {
      const { error: insertError } = await supabase
        .from('platform_config')
        .insert({
          key: 'payment_gateways',
          value: JSON.stringify(existingConfig),
          description: 'Payment gateway configurations'
        });
      
      if (insertError) {
        console.error('Error inserting config:', insertError);
        throw new Error('Failed to create configuration');
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Gateway Settings
            </CardTitle>
            <CardDescription>Configure payment provider integration details</CardDescription>
          </div>
          <Button variant="outline" onClick={fetchPaymentConfigs} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="2checkout">2Checkout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe">
              <Form {...stripeForm}>
                <form onSubmit={stripeForm.handleSubmit(saveStripeConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Stripe</h3>
                        <p className="text-sm text-muted-foreground">
                          Accept credit card payments via Stripe
                        </p>
                      </div>
                      <FormField
                        control={stripeForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Enabled</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={stripeForm.control}
                      name="test_mode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Test Mode</FormLabel>
                            <FormDescription>
                              Use Stripe in test mode (no real charges)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stripeForm.control}
                      name="publishable_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publishable Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="pk_test_..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Your Stripe publishable key (starts with pk_)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={stripeForm.control}
                      name="secret_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="sk_test_..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Your Stripe secret key (starts with sk_)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save Stripe Configuration'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="paypal">
              <Form {...paypalForm}>
                <form onSubmit={paypalForm.handleSubmit(savePaypalConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">PayPal</h3>
                        <p className="text-sm text-muted-foreground">
                          Accept payments via PayPal
                        </p>
                      </div>
                      <FormField
                        control={paypalForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Enabled</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={paypalForm.control}
                      name="test_mode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Sandbox Mode</FormLabel>
                            <FormDescription>
                              Use PayPal in sandbox mode (no real charges)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paypalForm.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="PayPal Client ID" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paypalForm.control}
                      name="secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="PayPal Secret" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save PayPal Configuration'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="2checkout">
              <Form {...twoCheckoutForm}>
                <form onSubmit={twoCheckoutForm.handleSubmit(saveTwoCheckoutConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">2Checkout</h3>
                        <p className="text-sm text-muted-foreground">
                          Accept payments via 2Checkout
                        </p>
                      </div>
                      <FormField
                        control={twoCheckoutForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Enabled</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={twoCheckoutForm.control}
                      name="test_mode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Sandbox Mode</FormLabel>
                            <FormDescription>
                              Use 2Checkout in sandbox mode (no real charges)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={twoCheckoutForm.control}
                      name="merchant_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="2Checkout Merchant Code" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={twoCheckoutForm.control}
                      name="secret_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="2Checkout Secret Key" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save 2Checkout Configuration'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentGatewaysConfig;
