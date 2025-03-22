import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/services/auth.service';
import { loginVolunteer } from '@/services/auth.service';
import { useAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type LoginFormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // If already logged in as volunteer, redirect to volunteer dashboard
  useEffect(() => {
    if (user && user.role === 'volunteer') {
      navigate('/volunteer/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      console.log('Starting login process...');
      
      const result = await loginVolunteer(data);
      console.log('Login result:', result);
      
      if (result.success && result.user) {
        console.log('Login successful');
        
        // Set user in context
        setUser(result.user);
        
        // Show success toast
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        
        // Navigate to dashboard
        navigate('/volunteer/dashboard', { replace: true });
      } else {
        console.log('Login failed:', result.message);
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      console.log('Login process completed, setting loading to false');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Volunteer Login</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to access your volunteer dashboard
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="volunteer@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
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
              
              <div className="text-center space-y-2">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link to="/admin/login" className="hover:underline">
                    Admin Login
                  </Link>
                  <span className="block mt-1 text-xs">
                    Administrators must log in separately through the Admin Login page
                  </span>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Login; 