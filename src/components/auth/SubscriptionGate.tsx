
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface SubscriptionGateProps {
  children: ReactNode;
}

const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const { user, profile, subscription, loading, isRoleSuperAdmin, isRoleAdmin } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Short timeout to ensure subscription data is loaded
    const timer = setTimeout(() => {
      setCheckingSubscription(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // If still loading auth or checking subscription, show loading state
  if (loading || checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Admin and Super Admin users don't need a subscription
  if (profile && (profile.role === 'super_admin' || profile.role === 'admin')) {
    console.log(`Admin user detected (${profile.role}), bypassing subscription check`);
    return <>{children}</>;
  }

  // Check if farmer has an active subscription (including free tier)
  if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trial')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-600">Subscription Required</CardTitle>
            <CardDescription>
              You need an active subscription to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Please choose a subscription plan to continue using AgroSense Hub and gain access to all features.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button onClick={() => navigate('/subscription/plans')}>
              View Subscription Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User has an active subscription, allow access
  return <>{children}</>;
};

export default SubscriptionGate;
