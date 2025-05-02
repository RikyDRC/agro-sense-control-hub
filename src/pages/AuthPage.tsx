
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'admin' | 'super_admin'>('farmer');
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
    
    // Check if there are any users in the system to determine if this is initial setup
    const checkUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error('Error checking user count:', error);
          return;
        }
        
        setUserCount(count || 0);
        setIsInitialSetup(count === 0);
        
        // If this is initial setup, default to creating a super admin
        if (count === 0) {
          setSelectedRole('super_admin');
          setActiveTab('signup');
          setDisplayName('System Administrator');
          toast.info('Welcome to initial setup! Please create a Super Admin account.');
        }
      } catch (err) {
        console.error('Error checking user count:', err);
      }
    };
    
    checkUserCount();
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
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
      
      const { error } = await signUp(
        email, 
        password, 
        displayName, 
        selectedRole
      );
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast.success('Signed up successfully. Check your email for confirmation.');
      
      // If this is the first user (super admin), automatically log them in
      if (isInitialSetup) {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsProcessing(false);
    }
  };

  const fillSuperAdminCredentials = () => {
    setEmail('super@agrosense.com');
    setPassword('SuperAdmin123!');
    setDisplayName('Super Administrator');
    setSelectedRole('super_admin');
    setActiveTab('signup');
  };

  const fillAdminCredentials = () => {
    setEmail('admin@agrosense.com');
    setPassword('Admin123!');
    setDisplayName('Admin User');
    setSelectedRole('admin');
    setActiveTab('signup');
  };

  const fillFarmerCredentials = () => {
    setEmail('farmer@agrosense.com');
    setPassword('Farmer123!');
    setDisplayName('Farmer User');
    setSelectedRole('farmer');
    setActiveTab('signup');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AgroSmart</h1>
          <p className="text-muted-foreground">Smart irrigation and farm management</p>
        </div>

        {isInitialSetup && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Welcome to initial setup! Please create your Super Admin account to get started.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
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
                    <Label htmlFor="email">Email</Label>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button type="button" variant="link" className="p-0 h-auto text-xs">
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium">Quick Login</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillSuperAdminCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                        Super Admin
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillAdminCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                        Admin
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillFarmerCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        Farmer
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Register for a new account to start managing your farm
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
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
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
                    <Label htmlFor="signup-password">Password</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value as 'farmer' | 'admin' | 'super_admin')}
                      disabled={isInitialSetup} // Lock to super_admin for initial setup
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {isInitialSetup ? (
                      <p className="text-xs text-blue-600">
                        First user must be a Super Admin for system setup
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Select your role in the organization
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium">Quick Setup</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillSuperAdminCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                        Super Admin
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillAdminCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                        Admin
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={fillFarmerCredentials}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                        Farmer
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <span>Creating account...</span>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
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
