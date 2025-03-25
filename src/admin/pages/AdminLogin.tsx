import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/services/auth.service';
import { loginAdmin } from '@/services/auth.service';
import { useAdminAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import Logo from '../../assets/logo.png'; // Add this import

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
  
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
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
        }, 300);
      }
    }, 150);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      const result = await loginAdmin(data);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: 'Login successful',
          description: 'Welcome back, admin!',
        });
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen relative">
      {/* Logo and Title in top-right corner */}
      <div className="absolute top-7 left-16 flex items-center">
        <img className="h-10 w-auto mr-2" src={Logo} alt="Samarthanam logo" />
        <span className="font-semibold text-2xl text-gray-900 ml-2">Samarth Connect</span>
      </div>

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
      <div className="w-1/2 flex flex-col justify-center p-16 pt-24"> {/* Added pt-24 to avoid overlap with logo */}
        <div className="max-w-md mx-auto w-full">
          <h3 className="text-2xl font-medium mb-8">Welcome Back!</h3>
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
            <div className="text-center text-sm">
              Forgot password? <a href="#" className="text-blue-600">Click here</a>
            </div>
          </form>
        </div>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminLogin;