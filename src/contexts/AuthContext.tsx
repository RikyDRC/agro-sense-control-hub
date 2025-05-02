
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Also fetch profile data if needed
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!profileError && profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          
          // Check if user is admin
          const userRoles = sessionData.session.user.app_metadata?.roles || [];
          setIsAdmin(userRoles.includes('super_admin'));
          
          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to initialize authentication',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Call init function
    initAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Check if user is admin
        const userRoles = session.user.app_metadata?.roles || [];
        setIsAdmin(userRoles.includes('super_admin'));
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!profileError) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // Sign up function
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  // Update profile function
  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update user metadata if needed
      if (data.email || data.phone || data.name) {
        const userUpdateData: any = {};
        
        if (data.email) userUpdateData.email = data.email;
        if (data.phone) userUpdateData.phone = data.phone;
        
        const { error: userError } = await supabase.auth.updateUser({
          ...userUpdateData,
          data: { name: data.name }
        });
        
        if (userError) throw userError;
      }
      
      // Update profile in profiles table
      const updates = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });
        
      if (profileError) throw profileError;
      
      // Refresh profile data
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  // Expose auth context values
  const contextValue = {
    user,
    session,
    loading,
    profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    isAdmin
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
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
