import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  Briefcase, 
  Building, 
  Calendar, 
  Globe, 
  Heart, 
  Users 
} from 'lucide-react';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Separator } from '@/components/ui/separator';
import LandingHeader from '@/components/LandingHeader';
import { useLanguage } from '../components/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  const missionPoints = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: t('education'),
      description: t('educationDescription')
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: t('employment'),
      description: t('employmentDescription')
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: t('inclusion'),
      description: t('inclusionDescription')
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: t('awareness'),
      description: t('awarenessDescription')
    }
  ];

  const milestones = [
    {
      year: "1997",
      title: t('foundation'),
      description: t('foundationDescription')
    },
    {
      year: "2005",
      title: t('educationCenter'),
      description: t('educationCenterDescription')
    },
    {
      year: "2010",
      title: t('digitalAccess'),
      description: t('digitalAccessDescription')
    },
    {
      year: "2015",
      title: t('nationalExpansion'),
      description: t('nationalExpansionDescription')
    },
    {
      year: "2020",
      title: t('globalRecognition'),
      description: t('globalRecognitionDescription')
    },
    {
      year: t('present'),
      title: t('embracingTechnology'),
      description: t('embracingTechnologyDescription')
    }
  ];

  const teamMembers = [
    {
      name: t('mahanteshName'),
      position: t('mahanteshPosition'),
      image: "data:image/jpeg;base64,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"
    },
    {
      name: t('supriyaName'),
      position: t('supriyaPosition'),
    image: "data:image/jpeg;base64,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"
    },
    {
      name: t('rameshName'),
      position: t('rameshPosition'),
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSBuFXgq3jf1eqWCDpBWJqlhH9d6ANbAa9dA&s"
    },
    {
      name: t('priyaName'),
      position: t('priyaPosition'),
    image: "data:image/jpeg;base64,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"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      
      <main className="flex-grow">
        <Hero 
          title={t('aboutTitle')} 
          subtitle={t('aboutSubtitle')}
          showCta={false}
        />
        
        {/* Mission & Vision Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                {t('ourPurpose')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('missionVision')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('missionVisionDescription')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {missionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <div className="flex justify-center mb-4">
                    {point.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{point.title}</h3>
                  <p className="text-muted-foreground text-center">{point.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Journey Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                {t('ourJourney')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('milestonesAchievements')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('milestonesDescription')}
              </p>
            </motion.div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px top-0 h-full w-px bg-border"></div>
              
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative flex flex-col md:flex-row items-center md:justify-between mb-12 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
                  
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                      <div className="text-primary font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="md:w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Impact Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                {t('ourImpact')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('makingDifference')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('impactDescription')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <img 
                  src="https://samarthanam.org/wp-content/uploads/2023/03/Samarthanam-Trust-in-partnership-with-Intel-distributed-First-Aid-Kits-and-Menstrual-Hygiene-Kits-MHM-to-the-adolescent-girl-students-1.jpg" 
                  alt={t('communityImpactAlt')} 
                  className="rounded-xl shadow-lg"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">{t('empoweringLives')}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t('empoweringLivesDescription')}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">{t('creatingOpportunities')}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t('creatingOpportunitiesDescription')}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">{t('communityEngagement')}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t('communityEngagementDescription')}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">{t('recognition')}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t('recognitionDescription')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Leadership Team Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                {t('ourTeam')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('leadership')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('leadershipDescription')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                    <p className="text-muted-foreground">{member.position}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default About;