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
  const { checkAuth, user } = useAuth();
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
      navigate('/volunteer/dashboard');
    }
  }, [user, navigate]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      const result = await loginVolunteer(data);
      
      if (result.success) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        await checkAuth(); // Update auth context
        // Always redirect to volunteer dashboard
        navigate('/volunteer/dashboard', { replace: true });
      } else {
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: Error | unknown) {
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