import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const JoinUs: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-28 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold mb-4">Join Our Volunteer Community</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Make a difference in the lives of visually impaired, disabled, and underprivileged individuals 
                by becoming a part of our supportive community.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing User Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LogIn className="mr-2 h-5 w-5 text-primary" />
                      Existing Volunteer
                    </CardTitle>
                    <CardDescription>
                      Already registered? Log in to your account to access your dashboard, view upcoming events, and manage your profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Access your personalized volunteer dashboard</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Sign up for upcoming volunteer opportunities</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Track your volunteer hours and contributions</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full mt-8" 
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Log In
                      <LogIn className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* New User Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="mr-2 h-5 w-5 text-primary" />
                      New Volunteer
                    </CardTitle>
                    <CardDescription>
                      Ready to make a difference? Register as a volunteer and start your journey with Samarthanam Trust.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Create your volunteer profile with skills and interests</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Get matched with opportunities that suit your preferences</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>Join a community of like-minded individuals making an impact</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full mt-8" 
                      size="lg"
                      onClick={() => navigate('/register')}
                    >
                      Register
                      <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default JoinUs; 