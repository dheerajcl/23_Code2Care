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
        setTimeout(() => {
          if (user) {
            console.log("User role in AuthCallback:", user.role); // Debug log
            
            if (user.role === 'volunteer') {
              // Volunteers always go to volunteer dashboard
              navigate('/volunteer/dashboard', { replace: true });
            } else if (user.role === 'admin') {
              // Admins always go to admin dashboard - no questions asked
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
        }, 100); // Minimal delay for faster redirection
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
        setLoading(false);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, checkAuth, user]);

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