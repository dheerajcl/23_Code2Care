import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Users, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from('event').select('*');

      if (error) {
        console.error('Error fetching events:', error.message);
        setError('Failed to load events. Please try again later.');
      } else {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <Header />
      <AccessibilityMenu />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Upcoming Events</h1>
        {loading ? (
          <p className="text-center">Loading events...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
                <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const impactStats = [
  { icon: <Users className="h-12 w-12 text-primary" />, value: "20,000+", label: "Lives Impacted" },
  { icon: <Calendar className="h-12 w-12 text-primary" />, value: "500+", label: "Events Organized" },
  { icon: <Heart className="h-12 w-12 text-primary" />, value: "5,000+", label: "Volunteers Engaged" },
  { icon: <BookOpen className="h-12 w-12 text-primary" />, value: "15+", label: "Years of Service" }
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <section id="content-section" className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {impactStats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-card rounded-xl p-6 text-center shadow-sm border border-border">
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
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
                  About Us
                </span>
                <h2 className="text-3xl font-bold mb-6">
                  Breaking Barriers for Inclusive Growth
                </h2>
                <p className="text-muted-foreground mb-6">
                  Founded in 1997, Samarthanam Trust has been at the forefront of 
                  empowering persons with disabilities through various initiatives 
                  in education, livelihood, sports, rehabilitation, and cultural activities.
                </p>
                <p className="text-muted-foreground mb-6">
                  Our technology-driven approach ensures that we can provide the right tools and 
                  resources to help individuals overcome barriers and achieve their full potential.
                </p>
                <Button asChild>
                  <Link to="/about">
                    Learn More About Us
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
                  alt="Samarthanam Trust community activities" 
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
