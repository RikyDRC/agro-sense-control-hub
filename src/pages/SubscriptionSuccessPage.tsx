
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('subscription');
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Call check-subscription function to update subscription status
        await refreshSubscription();
        // Short timeout to ensure database is updated
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('Could not verify your subscription status');
        setLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId, refreshSubscription]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t('success.processing')}</CardTitle>
            <CardDescription>{t('success.pleaseWait')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-16 w-16 text-agro-green animate-spin mb-4" />
            <p className="text-center text-muted-foreground">
              {t('success.takingTime')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-500">{t('success.verificationIssue')}</CardTitle>
            <CardDescription>{t('success.verificationProblem')}</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <p className="text-center mb-4">{error}</p>
            <p className="text-center text-muted-foreground">
              {t('success.dontWorry')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/subscription/plans')}>
              {t('success.backToPlans')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-agro-green">{t('success.title')}</CardTitle>
          <CardDescription>{t('success.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <CheckCircle2 className="h-16 w-16 text-agro-green mb-4" />
          <p className="text-center">
            {t('success.activated')}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button onClick={() => navigate('/dashboard')}>
            {t('success.goToDashboard')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;
