import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import LandingHeader from '@/components/LandingHeader';
import { supabase } from '@/lib/supabase';

// Password reset schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [validResetLink, setValidResetLink] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify the reset token when the component mounts
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Get hash fragment from URL (Supabase puts the token in the hash)
        const hash = window.location.hash;
        
        if (!hash) {
          setValidResetLink(false);
          toast({
            title: 'Invalid Reset Link',
            description: 'The password reset link is invalid or has expired.',
            variant: 'destructive',
          });
          return;
        }
        
        // The reset link with hash should automatically be handled by Supabase auth
        // Here we just check if the user session exists after the hash is processed
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setValidResetLink(false);
          toast({
            title: 'Invalid Reset Link',
            description: 'The password reset link is invalid or has expired.',
            variant: 'destructive',
          });
          return;
        }
        
        setValidResetLink(true);
      } catch (error) {
        console.error('Error checking reset token:', error);
        setValidResetLink(false);
        toast({
          title: 'Error',
          description: 'There was an error processing your reset link.',
          variant: 'destructive',
        });
      }
    };

    checkResetToken();
  }, []);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setLoading(true);
      console.log('Starting password reset process...');
      
      // Verify the session first
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData.session ? 'Active' : 'None');
      
      if (!sessionData.session) {
        // If no session, try to get the hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('URL hash parameters:', { 
          accessToken: accessToken ? 'Present' : 'Missing', 
          refreshToken: refreshToken ? 'Present' : 'Missing',
          type
        });
        
        if (accessToken) {
          console.log('Setting session from URL hash token');
          // Set the session manually using the token from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (sessionError) {
            console.error('Error setting session:', sessionError);
            toast({
              title: 'Authentication Error',
              description: 'Unable to verify your identity. Please try requesting a new password reset link.',
              variant: 'destructive',
            });
            return;
          }
        } else {
          console.error('No session and no access token in URL');
          toast({
            title: 'Authentication Error',
            description: 'No active session found. Please request a new password reset link.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Now proceed with password reset
      const result = await resetPassword(data.password);
      console.log('Password reset result:', result);
      
      if (result.success) {
        setResetSuccess(true);
        toast({
          title: 'Password Reset Successful',
          description: result.message,
        });
        
        // Force logout to ensure a clean session
        await supabase.auth.signOut();
      } else {
        toast({
          title: 'Password Reset Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking the token
  if (validResetLink === null) {
    return (
      <div className="min-h-screen flex flex-col mt-12">
        <LandingHeader />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Verifying your reset link...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if the token is invalid
  if (validResetLink === false) {
    return (
      <div className="min-h-screen flex flex-col mt-12">
        <LandingHeader />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-red-600">Invalid Reset Link</h1>
                <p className="text-muted-foreground mt-2">
                  The password reset link is invalid or has expired.
                </p>
              </div>
              <div className="text-center">
                <Button asChild className="mt-4">
                  <Link to="/forgot-password">Request New Reset Link</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <AccessibilityMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col mt-12">
      <LandingHeader />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Reset Your Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your new password below
              </p>
            </div>
            
            {resetSuccess ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-4 rounded-lg text-green-800 mb-6">
                  <p className="font-medium">Password reset successful!</p>
                  <p className="text-sm mt-1">Your password has been updated. You can now log in with your new password.</p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
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
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default ResetPassword; 