
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Users, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// Sample events data
const upcomingEvents = [
  {
    id: 1,
    title: "Braille Reading Workshop",
    description: "Learn the basics of Braille reading and writing in this interactive workshop led by experts.",
    date: "June 15, 2023",
    time: "10:00 AM - 1:00 PM",
    location: "Samarthanam HQ, Bengaluru",
    category: "Education",
    volunteersNeeded: 5,
    imageSrc: "data:image/jpeg;base64,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"
  },
  {
    id: 2,
    title: "Assistive Technology Fair",
    description: "Discover the latest assistive technologies for visually impaired individuals at our annual fair.",
    date: "June 22, 2023",
    time: "11:00 AM - 4:00 PM",
    location: "Krishnarajapura, Bengaluru",
    category: "Technology",
    volunteersNeeded: 8,
    imageSrc: "https://www.enablingguide.sg/images/default-source/default-album/img_8010.jpg?sfvrsn=16332630_0"
  },
  {
    id: 3,
    title: "Inclusive Sports Day",
    description: "Join us for a day of inclusive sports activities designed for participants of all abilities.",
    date: "July 8, 2023",
    time: "9:00 AM - 3:00 PM",
    location: "National Games Village, Bengaluru",
    category: "Sports",
    volunteersNeeded: 12,
    imageSrc: "https://sportcares.sportsingapore.gov.sg/images/Inclusive_Sports_Festival.jpg"
  }
];

const impactStats = [
  { 
    icon: <Users className="h-12 w-12 text-primary" />,
    value: "20,000+",
    label: "Lives Impacted" 
  },
  { 
    icon: <Calendar className="h-12 w-12 text-primary" />,
    value: "500+",
    label: "Events Organized" 
  },
  { 
    icon: <Heart className="h-12 w-12 text-primary" />,
    value: "5,000+",
    label: "Volunteers Engaged" 
  },
  { 
    icon: <BookOpen className="h-12 w-12 text-primary" />,
    value: "15+",
    label: "Years of Service" 
  }
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        {/* About Section */}
        <section id="content-section" className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering Through Inclusive Support
              </h2>
              <p className="text-muted-foreground text-lg">
                Samarthanam Trust for the Disabled is dedicated to providing 
                educational, financial, and technological support to visually impaired, 
                disabled, and underprivileged individuals, helping them build self-sufficient lives.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-card rounded-xl p-6 text-center shadow-sm border border-border"
                >
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
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
        
        {/* Events Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Upcoming Events
                </span>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Join Our Activities
                </h2>
              </div>
              <Button asChild variant="outline" className="mt-4 md:mt-0">
                <Link to="/events">
                  View All Events
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Volunteer CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-2xl p-8 md:p-12 lg:p-16 text-center max-w-5xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4zIiBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
              
              <div className="relative z-10">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground"
                >
                  Make a Difference Today
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
                >
                  Join our community of volunteers and help create a more inclusive world. 
                  Your skills and time can transform lives.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/register">
                      Become a Volunteer
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Index;
