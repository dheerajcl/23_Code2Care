import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, requestPasswordReset } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import LandingHeader from '@/components/LandingHeader';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/services/email.service';

type ForgotPasswordFormValues = {
  email: string;
};

// Debug component for admins
const SupabaseDebugInfo = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    // Check if user is an admin
    const checkAdmin = async () => {
      try {
        const { data: adminData } = await supabase
          .from('admin')
          .select('id')
          .limit(1);
        
        // If we can access admin table, user might be an admin
        if (adminData && adminData.length > 0) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdmin();
  }, []);

  // Skip rendering if not admin
  if (!isAdmin) return null;

  const checkSupabaseConfig = async () => {
    setChecking(true);
    try {
      // Check if Email provider is enabled
      const { data: authSettings, error: authError } = await supabase.rpc('get_auth_settings');
      
      let info = '## Supabase Configuration Debug ##\n\n';
      
      if (authError) {
        info += `Error fetching auth settings: ${authError.message}\n`;
      } else {
        info += 'Auth Settings: ' + (authSettings ? 'Available' : 'Not available') + '\n';
      }
      
      // Check project URL and anon key from environment
      info += `\nSupabase URL: ${import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'Not configured'}\n`;
      info += `Supabase Anon Key: ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'}\n`;
      
      // Check if we can connect to Supabase
      const { data: testData, error: testError } = await supabase
        .from('volunteer')
        .select('count')
        .limit(1);
      
      info += `\nConnection Test: ${testError ? 'Failed' : 'Successful'}\n`;
      if (testError) {
        info += `Connection Error: ${testError.message}\n`;
      }
      
      // Add suggestions
      info += '\n## Troubleshooting Steps ##\n';
      info += '1. Make sure Email provider is enabled in Supabase Authentication settings\n';
      info += '2. Check that SMTP is configured in Supabase\n';
      info += '3. Verify the "Reset Password" email template is set up\n';
      info += '4. Check if the user exists in both your volunteer table AND Supabase Auth\n';
      info += '5. Check spam folder for reset emails\n';
      
      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`Error checking configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChecking(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setTestResult('Please enter an email address');
      return;
    }

    setSendingTest(true);
    try {
      const result = await emailService.testEmailSending(testEmail);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="mt-8">
      <AccordionItem value="debug">
        <AccordionTrigger className="text-sm text-gray-500">Admin: Troubleshoot Email Issues</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Admin Debugging Tools</AlertTitle>
              <AlertDescription>
                Use these tools to diagnose email configuration issues.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkSupabaseConfig}
              disabled={checking}
            >
              {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
              Check Supabase Configuration
            </Button>
            
            {debugInfo && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                {debugInfo}
              </pre>
            )}

            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Send Test Email</h4>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="text-xs h-8"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sendTestEmail}
                  disabled={sendingTest || !testEmail}
                >
                  {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Test'}
                </Button>
              </div>
              {testResult && (
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2 max-h-60">
                  {testResult}
                </pre>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      console.log('Starting password reset request...');
      
      const result = await requestPasswordReset(data);
      console.log('Password reset request result:', result);
      
      if (result.success) {
        setEmailSent(true);
        toast({
          title: 'Password Reset Email Sent',
          description: result.message,
        });
      } else {
        toast({
          title: 'Password Reset Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
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
              <h1 className="text-3xl font-bold">Reset Your Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your email to receive password reset instructions
              </p>
            </div>
            
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-4 rounded-lg text-green-800 mb-6">
                  <p className="font-medium">Password reset email sent!</p>
                  <p className="text-sm mt-1">
                    Please check your email for instructions to reset your password.
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    It may take a few minutes for the email to arrive. If you still don't receive it,
                    please try again or contact support.
                  </AlertDescription>
                </Alert>
                
                <p>
                  Didn't receive an email?{' '}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => setEmailSent(false)}
                  >
                    Try again
                  </Button>
                </p>
                
                <p>
                  <Link to="/login" className="text-primary hover:underline">
                    Return to login
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="your-email@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                
                <div className="text-center">
                  <p>
                    <Link to="/login" className="text-primary hover:underline">
                      Back to login
                    </Link>
                  </p>
                </div>
              </form>
            )}
            
            <SupabaseDebugInfo />
          </CardContent>
        </Card>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default ForgotPassword; 