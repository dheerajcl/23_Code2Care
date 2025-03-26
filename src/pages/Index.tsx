import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Users, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { useVolunteerAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import LandingHeader from '@/components/LandingHeader';
import { useLanguage } from '../components/LanguageContext'; // Add language context import
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// Events component to show upcoming events
const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage(); // Add translation function
const { user, registeredEvents, registerForEvent } = useVolunteerAuth();
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('event')
        .select('*')
        .gt('close_date', new Date().toISOString())
        .limit(3);

      if (error) {
        console.error('Error fetching events:', error.message);
        setError(t('failedToLoadEvents')); // Use translated error message
      } else {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [t]); // Add t to dependencies
  const handleVolunteerSignup = async (eventId) => {
    if (!user) {
      toast.error('Please log in to register for events');
      navigate('/login');
      return false;
    }

    try {
      // Use registerForEvent from context
      return await registerForEvent(eventId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };
  return (
    <div>
      <LandingHeader />
      <AccessibilityMenu />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-6">{t('upcomingEvents')}</h1>
        {loading ? (
          <p className="text-center">{t('loadingEvents')}</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
             <div key={event.id}>
             <EventCard
               id={event.id.toString()}
               title={event.title}
               description={event.description}
               start_date={event.start_date}
               end_date={event.end_date}
               location={event.location}
               category={event.category}
               volunteersNeeded={event.volunteers_needed}
               image_url={event.image_url}
               isRegistered={registeredEvents && registeredEvents[event.id]} 
               isRecommended={false}
               loading={false}
               handleVolunteerSignup={() => handleVolunteerSignup(event.id)}
             />
           </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link to="/events">
              {t('showMore')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  const { t } = useLanguage(); // Add translation function

  // Update impactStats with translated labels
  const impactStats = [
    { icon: <Users className="h-12 w-12 text-primary" />, value: "20,000+", label: t('livesImpacted') },
    { icon: <Calendar className="h-12 w-12 text-primary" />, value: "500+", label: t('eventsOrganized') },
    { icon: <Heart className="h-12 w-12 text-primary" />, value: "5,000+", label: t('volunteersEngaged') },
    { icon: <BookOpen className="h-12 w-12 text-primary" />, value: "15+", label: t('yearsOfService') }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-grow">
        <Hero />
        <section id="content-section" className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {impactStats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: index * 0.1 }} 
                  className="bg-card rounded-xl p-6 text-center shadow-sm border border-border"
                >
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <h2 className="text-3xl font-bold mb-2">{stat.value}</h2>
                  <p className="text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {t('aboutUs')}
                </span>
                <h2 className="text-3xl font-bold mb-6">
                  {t('breakingBarriers')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('aboutDescription1')}
                </p>
                <p className="text-muted-foreground mb-6">
                  {t('aboutDescription2')}
                </p>
                <Button asChild>
                  <Link to="/about">
                    {t('learnMore')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className="rounded-xl overflow-hidden shadow-lg aspect-video"
              >
                <img 
                  src="https://samarthanam.org/wp-content/uploads/2024/07/volunteer-img1-group.jpg" 
                  alt={t('communityActivitiesAlt')} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
        <Events />
      </main>
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Index;