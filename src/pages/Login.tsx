import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/services/auth.service';
import { loginVolunteer } from '@/services/auth.service';
import { useVolunteerAuth } from '@/lib/authContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import LandingHeader from '@/components/LandingHeader';
import { useLanguage } from '../components/LanguageContext'; // Add language context import

type LoginFormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useVolunteerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage(); // Add translation hook
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
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
        
        setUser(result.user);
        
        toast({
          title: t('loginSuccessTitle'),
          description: t('loginSuccessDescription'),
        });
        
        navigate('/volunteer/dashboard', { replace: true });
      } else {
        console.log('Login failed:', result.message);
        toast({
          title: t('loginFailedTitle'),
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast({
        title: t('loginFailedTitle'),
        description: error instanceof Error ? error.message : t('somethingWentWrong'),
        variant: 'destructive',
      });
    } finally {
      console.log('Login process completed, setting loading to false');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col mt-12">
      <LandingHeader />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">{t('volunteerLogin')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('loginSubtitle')}
              </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </Button>
              
              <div className="text-center space-y-2">
                <p>
                  {t('noAccount')}{' '}
                  <Link to="/register" className="text-primary hover:underline">
                    {t('registerHere')}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link to="/admin/login" className="hover:underline">
                    {t('adminLogin')}
                  </Link>
                  <span className="block mt-1 text-xs">
                    {t('adminLoginNote')}
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