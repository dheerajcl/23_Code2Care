
import Hero from "@/components/Hero";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Users, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EventCard from "@/components/EventCard";

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
    imageSrc: "https://source.unsplash.com/random/800x600/?braille"
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
    imageSrc: "https://source.unsplash.com/random/800x600/?technology"
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
    imageSrc: "https://source.unsplash.com/random/800x600/?sports"
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

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* About Section */}
      <section id="content-section" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 text-center shadow-sm border border-border"
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
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
                <Link href="/about">
                  Learn More About Us
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div
              className="rounded-xl overflow-hidden shadow-lg aspect-video"
            >
              <img 
                src="https://source.unsplash.com/random/800x600/?community" 
                alt="Samarthanam Trust community activities" 
                className="w-full h-full object-cover"
              />
            </div>
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
              <Link href="/events">
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
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground"
              >
                Make a Difference Today
              </h2>
              
              <p 
                className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
              >
                Join our community of volunteers and help create a more inclusive world. 
                Your skills and time can transform lives.
              </p>
              
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">
                  Become a Volunteer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
