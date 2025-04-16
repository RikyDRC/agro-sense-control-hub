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

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
            fetchUserSubscription(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserSubscription(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:plan_id(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user subscription:', error);
        }
        setSubscription(null);
        return;
      }

      setSubscription(data as UserSubscription);
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      setSubscription(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchUserSubscription(user.id);
    }
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

      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ role })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

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
