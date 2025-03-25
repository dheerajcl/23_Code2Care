import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useAdminAuth, useVolunteerAuth } from '@/lib/authContext';
import LoadingSpinner from './LoadingSpinner';

type ProtectedRouteProps = {
  children: React.ReactNode;
  roles?: ('admin' | 'volunteer')[];
  redirectTo?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // Use the appropriate auth context based on roles
  const { user: contextUser, loading: contextLoading } = useAuth();
  const { user: adminUser, loading: adminLoading } = useAdminAuth();
  const { user: volunteerUser, loading: volunteerLoading } = useVolunteerAuth();
  
  // Determine if this is an admin or volunteer route
  const isAdminRoute = roles.includes('admin') && !roles.includes('volunteer');
  const isVolunteerRoute = roles.includes('volunteer') && !roles.includes('admin');
  
  // Select the appropriate user and loading state based on route type
  const user = isAdminRoute ? adminUser : (isVolunteerRoute ? volunteerUser : contextUser);
  const isLoading = isAdminRoute ? adminLoading : (isVolunteerRoute ? volunteerLoading : contextLoading);
  
  // Update loading state once contexts have finished loading
  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);
  
  // Show loader while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="large" text="Verifying authentication..." color="primary" />
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // If roles are specified and user's role is not included, redirect
  if (roles.length > 0 && !roles.includes(user.role as any)) {
    // If the user is authenticated but has the wrong role, redirect to the appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'volunteer') {
      return <Navigate to="/volunteer/dashboard" replace />;
    }
    
    // Default fallback
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute; 