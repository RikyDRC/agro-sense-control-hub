
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireAdmin, requireSuperAdmin }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const navigate = useNavigate();
  
  // Set a fixed timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 500);
    
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

  // Check for admin/super admin requirements
  if (requireSuperAdmin && profile && profile.role !== 'super_admin') {
    toast.error("You don't have permission to access this page. Super admin role required.");
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && profile && !['admin', 'super_admin'].includes(profile.role)) {
    toast.error("You don't have permission to access this page. Admin role required.");
    return <Navigate to="/dashboard" replace />;
  }

  // For role-protected routes, check role if profile is available
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    toast.error(`You don't have permission to access this page. Required role: ${allowedRoles.join(' or ')}`);
    
    // Send admins and super admins to dashboard, others to subscription page
    if (profile.role === 'super_admin' || profile.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/subscription/plans" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
