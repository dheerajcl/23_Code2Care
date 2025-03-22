import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // If we have a session, refresh auth context
        if (data.session) {
          await checkAuth();
        }

        // Check user role and redirect accordingly
        // Use a shorter timeout to ensure faster redirection
        setTimeout(() => {
          if (user) {
            console.log("User role in AuthCallback:", user.role); // Debug log
            
            if (user.role === 'volunteer') {
              // Volunteers always go to volunteer dashboard
              navigate('/volunteer/dashboard', { replace: true });
            } else if (user.role === 'admin') {
              // Admins go to admin dashboard
              navigate('/admin/dashboard', { replace: true });
            } else {
              // If role is not determined, go to home page
              console.log("No role determined, redirecting to home");
              navigate('/', { replace: true });
            }
          } else {
            // No user found, go to home page
            console.log("No user found, redirecting to home");
            navigate('/', { replace: true });
          }
          setLoading(false);
        }, 1000); // Reduced timeout for faster redirection
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, checkAuth, user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="mt-4 text-lg">Processing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <p className="text-red-600 font-semibold text-lg">Authentication Error</p>
          <p className="mt-2 text-gray-700">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      <p className="mt-4 text-lg">Redirecting...</p>
    </div>
  );
};

export default AuthCallback; 