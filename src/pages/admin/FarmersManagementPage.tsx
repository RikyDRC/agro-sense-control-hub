
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, UserCog, Users } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Farmer {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  subscription?: {
    id: string;
    status: string;
    plan?: {
      name: string;
    }
  } | null;
}

const FarmersManagementPage: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const { isRoleSuperAdmin } = useAuth();
  
  useEffect(() => {
    fetchFarmers();
  }, []);
  
  const fetchFarmers = async () => {
    try {
      setLoading(true);
      
      // Get all user profiles with role 'farmer'
      const { data: farmerProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'farmer');
      
      if (profilesError) {
        console.error('Error fetching farmer profiles:', profilesError);
        toast.error('Failed to load farmers');
        setLoading(false);
        return;
      }
      
      // Get subscription data for each farmer
      const farmersWithSubscriptions = await Promise.all(
        farmerProfiles.map(async (profile) => {
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select(`
              id, status,
              plan:plan_id(
                name
              )
            `)
            .eq('user_id', profile.id)
            .eq('status', 'active')
            .maybeSingle();
          
          return {
            ...profile,
            subscription: subscriptionData
          } as Farmer;
        })
      );
      
      setFarmers(farmersWithSubscriptions);
    } catch (err) {
      console.error('Error in fetchFarmers:', err);
      toast.error('An error occurred while loading farmers');
    } finally {
      setLoading(false);
    }
  };
  
  const activateSubscription = async (farmerId: string) => {
    if (!isRoleSuperAdmin()) {
      toast.error('Only super admins can activate subscriptions');
      return;
    }
    
    try {
      const { data: existingSubscription, error: existingError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', farmerId)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error checking existing subscription:', existingError);
        toast.error('Failed to check subscription status');
        return;
      }
      
      // Get a default plan
      const { data: defaultPlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })
        .limit(1)
        .single();
      
      if (!defaultPlan) {
        toast.error('No subscription plans available');
        return;
      }
      
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            plan_id: defaultPlan.id,
            updated_at: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })
          .eq('id', existingSubscription.id);
        
        if (updateError) {
          console.error('Error updating subscription:', updateError);
          toast.error('Failed to activate subscription');
          return;
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: farmerId,
            plan_id: defaultPlan.id,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          });
        
        if (insertError) {
          console.error('Error creating subscription:', insertError);
          toast.error('Failed to create subscription');
          return;
        }
      }
      
      toast.success('Subscription activated successfully');
      fetchFarmers(); // Refresh the list
    } catch (err) {
      console.error('Error in activateSubscription:', err);
      toast.error('An error occurred while activating subscription');
    }
  };
  
  const deactivateSubscription = async (farmerId: string) => {
    if (!isRoleSuperAdmin()) {
      toast.error('Only super admins can deactivate subscriptions');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', farmerId)
        .eq('status', 'active');
      
      if (error) {
        console.error('Error deactivating subscription:', error);
        toast.error('Failed to deactivate subscription');
        return;
      }
      
      toast.success('Subscription deactivated successfully');
      fetchFarmers(); // Refresh the list
    } catch (err) {
      console.error('Error in deactivateSubscription:', err);
      toast.error('An error occurred while deactivating subscription');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Farmers Management</h1>
        <p className="text-muted-foreground">Manage farmers and their subscription status</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Farmers
              </CardTitle>
              <CardDescription>Total: {farmers.length} farmers</CardDescription>
            </div>
            <Button onClick={fetchFarmers}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No farmers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    farmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-medium">
                          {farmer.display_name || 'Unnamed Farmer'}
                        </TableCell>
                        <TableCell>{farmer.email}</TableCell>
                        <TableCell>
                          {farmer.subscription?.status === 'active' ? (
                            <Badge className="bg-green-500">
                              Active: {farmer.subscription.plan?.name || 'Unknown Plan'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-300">
                              No Active Subscription
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedFarmer(farmer)}
                                >
                                  <UserCog className="h-4 w-4 mr-1" /> Manage
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Manage Farmer</DialogTitle>
                                  <DialogDescription>
                                    Manage subscription for {selectedFarmer?.display_name || selectedFarmer?.email}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold">{selectedFarmer?.display_name}</p>
                                      <p className="text-sm text-muted-foreground">{selectedFarmer?.email}</p>
                                    </div>
                                    
                                    {selectedFarmer?.subscription?.status === 'active' ? (
                                      <Badge className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active Subscription
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-amber-500 border-amber-300">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        No Active Subscription
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Subscription Actions:</p>
                                    
                                    {selectedFarmer?.subscription?.status === 'active' ? (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive">
                                            Deactivate Subscription
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will deactivate the subscription for {selectedFarmer?.display_name}.
                                              They will lose access to the dashboard immediately.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => selectedFarmer && deactivateSubscription(selectedFarmer.id)}
                                            >
                                              Deactivate
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    ) : (
                                      <Button 
                                        variant="default"
                                        onClick={() => selectedFarmer && activateSubscription(selectedFarmer.id)}
                                      >
                                        Activate Subscription
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button variant="outline">Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmersManagementPage;
