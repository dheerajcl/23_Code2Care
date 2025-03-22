import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Loader2 } from 'lucide-react';

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
  const { user, loading } = useAuth();
  const location = useLocation();
  const [localUser, setLocalUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  // Check localStorage as fallback
  useEffect(() => {
    if (!user) {
      // Try to get user from localStorage based on expected roles
      let storedUser = null;
      
      if (roles.includes('admin')) {
        const adminJson = localStorage.getItem('adminUser');
        if (adminJson) {
          try {
            const adminUser = JSON.parse(adminJson);
            if (adminUser?.role === 'admin') {
              storedUser = adminUser;
            }
          } catch (e) {
            // Invalid JSON
          }
        }
      }
      
      if (!storedUser && roles.includes('volunteer')) {
        const volunteerJson = localStorage.getItem('volunteerUser');
        if (volunteerJson) {
          try {
            const volunteerUser = JSON.parse(volunteerJson);
            if (volunteerUser?.role === 'volunteer') {
              storedUser = volunteerUser;
            }
          } catch (e) {
            // Invalid JSON
          }
        }
      }
      
      setLocalUser(storedUser);
    }
    
    setInitialized(true);
  }, [user, roles]);

  // Show loader while checking authentication
  if (loading || !initialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  // Use either context user or localStorage user
  const authenticatedUser = user || localUser;

  // If not authenticated, redirect to login
  if (!authenticatedUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not included, redirect
  if (roles.length > 0 && !roles.includes(authenticatedUser.role as any)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute; 