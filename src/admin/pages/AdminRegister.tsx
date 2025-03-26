import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminRegisterSchema } from '@/services/auth.service';
import { registerAdmin } from '@/services/auth.service';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import AccessibilityMenu from '@/components/AccessibilityMenu';


type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

const AdminRegister = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = "Join\nAdmin!";
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkAuth, user } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });
  
  // If already logged in, redirect to admin dashboard
  
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
        }, 300);
      }
    }, 150);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      const result = await registerAdmin(data);
      
      if (result.success) {
        toast({
          title: 'Registration successful',
          description: 'Your admin account has been created.',
        });
        await checkAuth(); // Refresh auth state
        navigate('/admin/dashboard'); // Redirect directly to dashboard
      } else {
        toast({
          title: 'Registration failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: Error | unknown) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
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
          {showEmoji && <span className="ml-2 mt-4 inline-block animate-bounce">✨</span>}
        </h1>
        <p className="mt-6">
          Create your admin account to access powerful tools
          and manage your platform with ease and efficiency.
        </p>
      </div>

      {/* Right side with registration form */}
      <div className="w-1/2 flex flex-col justify-center p-16">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold mb-1">Samarth Connect</h2>
          <h3 className="text-xl font-medium mb-8">Register Admin Account</h3>
          <p className="text-sm mb-6">
            Already have an account? <a href="/admin/login" className="text-blue-600 underline">Login here</a>.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className={`w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className={`w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-4">
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
            <div className="mb-6">
              <input 
                type="password" 
                placeholder="Confirm Password" 
                className={`w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="mb-6 flex items-start">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 mr-2"
                {...register('agreeTerms')}
              />
              <label htmlFor="terms" className={`text-sm ${errors.agreeTerms ? 'text-red-500' : 'text-gray-600'}`}>
                I agree to the <a href="#" className="text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-600">Privacy Policy</a>
              </label>
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white py-3 rounded-md mb-4 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Now'
              )}
            </button>
          </form>
        </div>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminRegister;