
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
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Separator } from '@/components/ui/separator';

const missionPoints = [
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Education",
    description: "Provide quality education and training to people with disabilities and from underprivileged backgrounds."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: "Employment",
    description: "Create meaningful employment opportunities through skill development and partnerships with industries."
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Inclusion",
    description: "Promote inclusion in all aspects of society, ensuring equal participation for all individuals."
  },
  {
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Awareness",
    description: "Increase public awareness about disabilities and advocate for supportive policies and infrastructure."
  }
];

const milestones = [
  {
    year: "1997",
    title: "Foundation",
    description: "Samarthanam Trust was founded with a vision to provide support to persons with disabilities and from underprivileged backgrounds."
  },
  {
    year: "2005",
    title: "Education Center",
    description: "Established our first dedicated education center with accessible infrastructure and learning materials."
  },
  {
    year: "2010",
    title: "Digital Access",
    description: "Launched digital literacy programs specifically designed for visually impaired individuals."
  },
  {
    year: "2015",
    title: "National Expansion",
    description: "Expanded operations to five states across India, reaching thousands more beneficiaries."
  },
  {
    year: "2020",
    title: "Global Recognition",
    description: "Received international recognition for our work in disability inclusion and accessibility innovation."
  },
  {
    year: "Present",
    title: "Embracing Technology",
    description: "Leveraging advanced technology to create more accessible solutions and reach wider communities."
  }
];

const teamMembers = [
  {
    name: "Mahantesh G Kivadasannavar",
    position: "Founder & Managing Trustee",
    image: "https://source.unsplash.com/random/300x300/?portrait=1"
  },
  {
    name: "Supriya Purwar",
    position: "Executive Director",
    image: "https://source.unsplash.com/random/300x300/?portrait=2"
  },
  {
    name: "Ramesh Kumar",
    position: "Director of Programs",
    image: "https://source.unsplash.com/random/300x300/?portrait=3"
  },
  {
    name: "Priya Sharma",
    position: "Technology Officer",
    image: "https://source.unsplash.com/random/300x300/?portrait=4"
  }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero 
          title="About Samarthanam Trust" 
          subtitle="Founded in 1997, Samarthanam Trust has been dedicated to empowering people with disabilities through education, employment, and inclusion."
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
                Our Purpose
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mission & Vision
              </h2>
              <p className="text-muted-foreground text-lg">
                We envision a world where all persons with disabilities have equal opportunities to education, 
                employment, and social inclusion, enabling them to live with dignity and independence.
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
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Milestones & Achievements
              </h2>
              <p className="text-muted-foreground text-lg">
                From our humble beginnings to our present impact, we have been driven by our commitment 
                to create a more inclusive world for all.
              </p>
            </motion.div>
            
            <div className="relative max-w-4xl mx-auto">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px top-0 h-full w-px bg-border"></div>
              
              {/* Timeline Items */}
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
                  {/* Timeline Dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
                  
                  {/* Content */}
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                      <div className="text-primary font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Spacer for opposite side */}
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
                Our Impact
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Making a Difference
              </h2>
              <p className="text-muted-foreground text-lg">
                Our work has touched thousands of lives across the country, creating lasting positive change 
                for individuals with disabilities and their communities.
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
                  src="https://source.unsplash.com/random/800x600/?community" 
                  alt="Samarthanam community impact" 
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
                    <h3 className="text-xl font-semibold">Empowering Lives</h3>
                  </div>
                  <p className="text-muted-foreground">
                    We have provided education and skill development to over 20,000 individuals with 
                    disabilities, helping them achieve independence and dignity.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Building className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">Creating Opportunities</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our partnerships with 200+ companies have created employment opportunities for 
                    thousands of persons with disabilities in diverse sectors.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">Community Engagement</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Through 500+ events and workshops, we've raised awareness about disability 
                    inclusion and built supportive communities across the country.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-primary mr-2" />
                    <h3 className="text-xl font-semibold">Recognition</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our work has been recognized with numerous national and international awards 
                    for excellence in disability empowerment and inclusion.
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
                Our Team
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Leadership
              </h2>
              <p className="text-muted-foreground text-lg">
                Meet the dedicated team leading Samarthanam's mission to create a more inclusive world.
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
