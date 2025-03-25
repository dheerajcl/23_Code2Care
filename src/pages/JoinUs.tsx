import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LandingHeader from '@/components/LandingHeader';
import { useLanguage } from '../components/LanguageContext'; // Add language context import

const JoinUs: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage(); // Add translation hook
  
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow">
        <section className="py-28 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold mb-4">{t('joinUsTitle')}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('joinUsSubtitle')}
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
                      {t('existingVolunteer')}
                    </CardTitle>
                    <CardDescription>
                      {t('existingVolunteerDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('existingVolunteerFeature1')}</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('existingVolunteerFeature2')}</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('existingVolunteerFeature3')}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full mt-8" 
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      {t('logIn')}
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
                      {t('newVolunteer')}
                    </CardTitle>
                    <CardDescription>
                      {t('newVolunteerDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('newVolunteerFeature1')}</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('newVolunteerFeature2')}</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{t('newVolunteerFeature3')}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full mt-8" 
                      size="lg"
                      onClick={() => navigate('/register')}
                    >
                      {t('register')}
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