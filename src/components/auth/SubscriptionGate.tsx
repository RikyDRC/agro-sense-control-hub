
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubscriptionGateProps {
  children: ReactNode;
}

const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const { user, profile, subscription, loading, isRoleSuperAdmin, isRoleAdmin } = useAuth();
  const { limits } = useSubscriptionLimits();
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

  // Check if farmer has an active subscription or pending approval
  if (subscription && (subscription.status === 'active' || subscription.status === 'trial')) {
    return <>{children}</>;
  }

  // If user doesn't have a subscription, redirect to plans page
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
          
          {/* Show current limits */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium">Your current limits:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="outline">Zones: {limits.maxZones === Infinity ? '∞' : limits.maxZones}</Badge>
              <Badge variant="outline">Devices: {limits.maxDevices === Infinity ? '∞' : limits.maxDevices}</Badge>
              <Badge variant="outline">Crops: {limits.maxCrops === Infinity ? '∞' : limits.maxCrops}</Badge>
              <Badge variant={limits.hasAutomation ? "default" : "secondary"}>
                Automation: {limits.hasAutomation ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
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
};

export default SubscriptionGate;
