
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, AlertTriangle, Sprout } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('auth');
  const { signIn, signUp, session, loading, subscription, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle redirection based on user role and subscription status
  useEffect(() => {
    if (session && profile) {
      console.log("Redirecting based on profile role:", profile.role);
      
      // If user is admin or super_admin, redirect to dashboard immediately
      if (profile.role === 'super_admin' || profile.role === 'admin') {
        navigate('/dashboard');
        return;
      } 
      
      // For farmers, check subscription status
      if (subscription && (subscription.status === 'active' || subscription.status === 'trial')) {
        navigate('/dashboard');
      } else {
        // If no active subscription, send to subscription plans
        navigate('/subscription/plans');
      }
    }
  }, [session, navigate, subscription, profile]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setIsProcessing(false);
        return;
      }
      
      toast.success('Signed in successfully');
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsProcessing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validate password strength
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setIsProcessing(false);
        return;
      }

      if (!displayName.trim()) {
        setError('Full name is required');
        setIsProcessing(false);
        return;
      }
      
      const { error } = await signUp(
        email, 
        password, 
        displayName.trim(), 
        'farmer' // Default role for all new users
      );
      
      if (error) {
        setError(error.message);
        setIsProcessing(false);
        return;
      }
      
      toast.success('Account created successfully. Please check your email for confirmation.');
      setActiveTab('signin');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>{t('common:buttons.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Sprout className="text-agro-green-dark h-8 w-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-agro-green rounded-full animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold">Irrify</h1>
          </div>
          <p className="text-muted-foreground">Smart irrigation and farm management</p>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
              <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>{t('welcomeBack')}</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> {t('signIn')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>{t('createAccount')}</CardTitle>
                  <CardDescription>
                    {t('getStarted')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <span>Creating account...</span>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> {t('createAccount')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
