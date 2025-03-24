import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth, useAdminAuth, useVolunteerAuth } from '@/lib/authContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { checkAuth: checkAdminAuth } = useAdminAuth();
  const { checkAuth: checkVolunteerAuth } = useVolunteerAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session from URL (Supabase automatically processes this)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        // If we have a session, check user information
        if (data.session) {
          // Get user information from Supabase session
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, email, first_name, last_name')
            .eq('id', data.session.user.id)
            .single();

          if (userError) {
            setError(userError.message);
            setLoading(false);
            return;
          }

          if (userData) {
            setUserRole(userData.role);
            
            // Check auth in the appropriate context based on role
            if (userData.role === 'admin') {
              await checkAdminAuth();
            } else if (userData.role === 'volunteer') {
              await checkVolunteerAuth();
            }
            
            // Also check the main auth context for backward compatibility
            await checkAuth();
          }
        }

        // Check user role and redirect accordingly
        setTimeout(() => {
          if (userRole === 'volunteer') {
            // Volunteers always go to volunteer dashboard
            navigate('/volunteer/dashboard', { replace: true });
          } else if (userRole === 'admin') {
            // Admins always go to admin dashboard - no questions asked
            navigate('/admin/dashboard', { replace: true });
          } else {
            // If role is not determined, go to home page
            console.log("No role determined, redirecting to home");
            navigate('/', { replace: true });
          }
          setLoading(false);
        }, 100); // Minimal delay for faster redirection
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, checkAuth, checkAdminAuth, checkVolunteerAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        <p className="ml-2 text-lg">Redirecting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Authentication error: {error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      <p className="ml-2 text-lg">Redirecting...</p>
    </div>
  );
};

export default AuthCallback; 