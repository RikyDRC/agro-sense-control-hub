
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail, LayoutDashboard } from 'lucide-react';

const SubscriptionPendingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('subscription');

  // Properly type and handle the steps array
  const steps = t('pending.steps', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">{t('pending.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('pending.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>{t('pending.received')}</span>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900">{t('pending.whatNext')}</h3>
                    <ul className="mt-2 text-sm text-blue-800 space-y-1">
                      {Array.isArray(steps) && steps.map((step: string, index: number) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <LayoutDashboard className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-green-900">{t('pending.accessDashboard')}</h3>
                    <p className="mt-2 text-sm text-green-800">
                      {t('pending.dashboardDescription')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> {t('pending.note')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                {t('pending.returnHome')}
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('pending.accessMyDashboard')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPendingPage;
