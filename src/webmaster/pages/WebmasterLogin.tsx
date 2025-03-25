import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, loginWebmaster } from '@/services/auth.service';
import { useWebmasterAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AccessibilityMenu from '@/components/AccessibilityMenu';

type LoginFormValues = {
  email: string;
  password: string;
};

export const WebmasterLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useWebmasterAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // If already logged in as webmaster, redirect to webmaster dashboard
  useEffect(() => {
    if (user && user.role === 'webmaster') {
      navigate('/webmaster/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      
      const result = await loginWebmaster(data);
      
      if (result.success && result.user) {
        // Set user in webmaster context
        setUser(result.user);
        
        // Show success toast
        toast({
          title: 'Login successful',
          description: 'Welcome to the Webmaster Portal',
        });
        
        // Navigate to dashboard
        navigate('/webmaster/dashboard', { replace: true });
      } else {
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Webmaster login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left side with brand info */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white flex-col justify-center p-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">Samarth Connect</h1>
          <p className="text-xl font-light">Webmaster Portal</p>
        </div>
        <p className="text-lg">
          Access the administrative interface with read-only permissions. 
          Monitor activities, view statistics, and gain insights without making changes.
        </p>
        <div className="mt-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Read-Only Access</h3>
              <p className="text-sm text-blue-200">Safely view all platform data</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.54 15h6.42l.5 1.5H8.29l.5-1.5zm8.085-8.995a.75.75 0 10-.75-1.299 12.81 12.81 0 00-3.558 3.05L11.03 8.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 001.146-.102 11.312 11.312 0 013.612-3.321z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Data Visualization</h3>
              <p className="text-sm text-blue-200">View meaningful insights and reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Webmaster Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the webmaster portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="webmaster@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                <div className="mt-6 border-t pt-4">
                  <p>
                    This portal is for authorized webmasters only. If you're a volunteer, please use the main login.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <AccessibilityMenu/>
    </div>
  );
}; 