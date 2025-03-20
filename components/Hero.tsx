
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeroProps {
  title?: string;
  subtitle?: string;
  showCta?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  title = "Empowering Lives Through Inclusive Technology",
  subtitle = "Join Samarthanam Trust in our mission to support visually impaired, disabled, and underprivileged individuals through accessibility, education, and community.",
  showCta = true
}) => {
  const scrollToContent = () => {
    // Scroll to the content section below the hero
    const contentSection = document.getElementById('content-section');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50 z-10"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLW9wYWNpdHk9Ii4yIiBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-30 dark:opacity-10"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {showCta && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  Become a Volunteer
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        aria-label="Scroll down"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 1.2,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 0.5
        }}
      >
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </motion.button>
    </div>
  );
};

export default Hero;
