
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
  signUp: (email: string, password: string, displayName?: string, role?: UserRole) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  isRoleSuperAdmin: () => boolean;
  isRoleAdmin: () => boolean;
  isRoleFarmer: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  // Function to safely fetch user profile without causing recursion
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, display_name, role, profile_image, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log("Profile data received:", data);
      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Function to safely fetch user subscription without causing recursion
  const fetchUserSubscription = async (userId: string) => {
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
    // First set up the auth state listener to avoid missing any auth events
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          setLoading(true);
          // Use timeout to prevent potential deadlocks with Supabase auth
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(newSession.user.id);
            setProfile(userProfile);
            
            const userSubscription = await fetchUserSubscription(newSession.user.id);
            setSubscription(userSubscription);
            
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
          setLoading(false);
        }
      }
    );

    // Initial session check
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Initial session check:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
        
        const userSubscription = await fetchUserSubscription(currentSession.user.id);
        setSubscription(userSubscription);
      }
      
      setLoading(false);
    };
    
    initAuth();

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
    setLoading(false);
  };

  const refreshSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    const userSubscription = await fetchUserSubscription(user.id);
    setSubscription(userSubscription);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, role: UserRole = 'farmer') => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            role: role
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      // No need to update the profile immediately as the trigger will handle it
      return { error: null };
    } catch (error: any) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSubscription(null);
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
        hasRole
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
