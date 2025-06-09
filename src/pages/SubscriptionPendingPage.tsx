
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail, LayoutDashboard } from 'lucide-react';

const SubscriptionPendingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Request Submitted Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your interest in AgroSense Hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Your subscription request has been received</span>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900">What happens next?</h3>
                    <ul className="mt-2 text-sm text-blue-800 space-y-1">
                      <li>• Our team will review your request within 24-48 hours</li>
                      <li>• We'll contact you via phone or email to verify your information</li>
                      <li>• Once approved, you'll receive full access to all premium features</li>
                      <li>• You'll be able to set up payment and start using unlimited features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <LayoutDashboard className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-green-900">Access Your Dashboard</h3>
                    <p className="mt-2 text-sm text-green-800">
                      While waiting for approval, you can access your dashboard in view-only mode. 
                      Explore the platform and prepare your farm data for when your account becomes fully active.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your account is currently in view-only mode with limited features. 
                  Once approved, you'll have full access to all premium features without any restrictions.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Access My Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPendingPage;
