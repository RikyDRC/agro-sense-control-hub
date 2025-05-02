
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();
  
  // Set a fixed timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 500); // Reduced from 1000ms to 500ms for faster feedback
    
    return () => clearTimeout(timer);
  }, []);

  // Update local loading state based on auth loading
  useEffect(() => {
    if (!loading) {
      setLocalLoading(false);
    }
  }, [loading]);

  // Force route to proceed after a certain timeout even if profile isn't loaded
  useEffect(() => {
    if (user && !profile) {
      const forceTimer = setTimeout(() => {
        console.log("Force proceeding despite missing profile");
        setLocalLoading(false);
      }, 3000);
      
      return () => clearTimeout(forceTimer);
    }
  }, [user, profile]);

  if (loading && localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // For role-protected routes, we still check, but only if we have profile data
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  // We're now returning the children even if we don't have a profile
  // This is a fallback to ensure the app doesn't get stuck
  return <>{children}</>;
};

export default ProtectedRoute;
