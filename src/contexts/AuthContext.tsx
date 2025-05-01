
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export type UserRole = 'super_admin' | 'admin' | 'farmer';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  phone_number: string | null; // Added phone_number field
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billing_interval: string;
  features: Record<string, any>;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  plan?: SubscriptionPlan;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, displayName?: string, role?: UserRole, phoneNumber?: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  isRoleSuperAdmin: () => boolean;
  isRoleAdmin: () => boolean;
  isRoleFarmer: () => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    try {
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase.rpc(
        'get_profile_by_id',
        { user_id: userId }
      );

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfileError(error.message);
        return null;
      }

      if (!data) {
        console.log("No profile data received");
        return null;
      }

      return data as unknown as UserProfile;
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error);
      setProfileError(error.message);
      return null;
    }
  };

  const fetchUserSubscription = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id, plan_id, status, start_date, end_date,
          plan:subscription_plans(id, name, description, price, billing_interval, features)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data as UserSubscription;
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);

    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (!currentSession?.user) {
        setProfile(null);
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
          
        const userSubscription = await fetchUserSubscription(currentSession.user.id);
        setSubscription(userSubscription);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(() => {
            handleAuthChange(event, currentSession);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.id);
      
      if (currentSession?.user) {
        handleAuthChange('INITIAL_SESSION', currentSession);
      } else {
        setLoading(false);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    if (fetchingProfile) return;
    
    setFetchingProfile(true);
    setProfileError(null);
    
    try {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (error: any) {
      console.error("Error refreshing profile:", error);
      setProfileError(error.message);
    } finally {
      setFetchingProfile(false);
    }
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const userSubscription = await fetchUserSubscription(user.id);
      setSubscription(userSubscription);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        toast.error(error.message);
      }
      
      return { error };
    } catch (error: any) {
      console.error("Sign in catch error:", error);
      toast.error(error.message || "Failed to sign in");
      return { error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, role: UserRole = 'farmer', phoneNumber?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            role: role,
            phone_number: phoneNumber || null
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message);
        return { error };
      }
      
      toast.success("Signup successful! Please check your email to confirm your account.");
      return { error: null };
    } catch (error: any) {
      console.error('Signup catch error:', error);
      toast.error(error.message || "Failed to sign up");
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSubscription(null);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { data: isSuperAdmin, error: checkError } = await supabase.rpc('is_current_user_super_admin');
      
      if (checkError) {
        console.error('Error checking super admin status:', checkError);
        toast.error('Failed to verify permissions: ' + checkError.message);
        return { error: checkError };
      }
      
      if (!isSuperAdmin) {
        return { error: new Error('Only super admins can update user roles') };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        return { error };
      }

      toast.success(`User role updated to ${newRole}`);
      return { error: null };
    } catch (error: any) {
      console.error('Error in updateUserRole:', error);
      toast.error(error.message || 'Failed to update user role');
      return { error };
    }
  };

  const isRoleSuperAdmin = () => profile?.role === 'super_admin';
  const isRoleAdmin = () => profile?.role === 'admin';
  const isRoleFarmer = () => profile?.role === 'farmer';
  const hasRole = (role: UserRole) => profile?.role === role;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        subscription,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshSubscription,
        isRoleSuperAdmin,
        isRoleAdmin,
        isRoleFarmer,
        hasRole,
        updateUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
