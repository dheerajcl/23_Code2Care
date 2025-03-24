import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/services/auth.service';
import { loginAdmin } from '@/services/auth.service';
import { useAdminAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

type LoginFormValues = {
  email: string;
  password: string;
};

const AdminLogin: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Hello\nAdmin!";
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  // Animation effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowEmoji(true);
        }, 300); // Show emoji after a small delay when typing finishes
      }
    }, 150); // Adjust typing speed (milliseconds)
    
    return () => clearInterval(typingInterval);
  }, []);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      console.log('Starting admin login process...');
      
      const result = await loginAdmin(data);
      console.log('Admin login result:', result);
      
      if (result.success && result.user) {
        console.log('Admin login successful');
        
        // Set user in admin context
        setUser(result.user);
        
        // Show success toast
        toast({
          title: 'Login successful',
          description: 'Welcome back, admin!',
        });
        
        // Navigate to dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Admin login failed:', result.message);
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      console.log('Admin login process completed, setting loading to false');
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen">
      {/* Left side with red background */}
      <div className="w-1/2 bg-red-600 flex flex-col justify-center p-16 text-white">
        <div className="mb-6">
          <span className="text-8xl">*</span>
        </div>
        <h1 className="text-6xl font-bold mb-2">
          {displayText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
          {showEmoji && <span className="ml-2 mt-4 inline-block animate-bounce">👋</span>}
        </h1>
        <p className="mt-6">
          Manage your platform efficiently. Access all the tools 
          you need to monitor and optimize your operations.
        </p>
      </div>

      {/* Right side with login form */}
      <div className="w-1/2 flex flex-col justify-center p-16">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold mb-1">Samarth Connect</h2>
          <h3 className="text-xl font-medium mb-8">Welcome Back!</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <input 
                type="email" 
                placeholder="admin@example.com" 
                className={`w-full border ${errors.email ? 'border-red-600' : 'border-gray-300'} p-3 rounded-md`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-6">
              <input 
                type="password" 
                placeholder="Password" 
                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white py-3 rounded-md mb-4 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login Now'
              )}
            </button>
            {/* <button 
              type="button" 
              className="w-full border border-gray-300 py-3 rounded-md flex items-center justify-center mb-4"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" className="mr-2">
                <path 
                  d="M19.6 10.2c0-.7-.1-1.3-.2-1.9h-9.5v3.7h5.5c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z" 
                  fill="#4285F4" 
                />
                <path 
                  d="M10 20c2.8 0 5.2-1 7-2.6l-3.4-2.5c-1 .6-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H.5v2.6C2.2 17.8 5.8 20 10 20z" 
                  fill="#34A853" 
                />
                <path 
                  d="M4 11.5c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V4.9H.5A9.96 9.96 0 0 0 0 10c0 1.6.4 3.2 1 4.5l3-2.3z" 
                  fill="#FBBC05" 
                />
                <path 
                  d="M10 3.6c1.6 0 3 .6 4.1 1.6l3-3C15.3.8 12.9 0 10 0 5.8 0 2.2 2.2.5 5.9l3.5 2.6c.9-2.5 3.2-4.4 6-4.4z" 
                  fill="#EA4335" 
                />
              </svg>
              Login with Google
            </button> */}
            <div className="text-center text-sm">
              Forgot password? <a href="#" className="text-blue-600">Click here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;