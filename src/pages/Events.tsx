import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import AccessibilityMenu from '../components/AccessibilityMenu';
import Hero from '../components/Hero';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';

// Sample events data
const allEvents = [
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
  },
  {
    id: 4,
    title: "Job Fair for Disabled Individuals",
    description: "Connect with employers who are committed to creating inclusive workplaces.",
    date: "July 15, 2023",
    time: "10:00 AM - 5:00 PM",
    location: "Palace Grounds, Bengaluru",
    category: "Employment",
    volunteersNeeded: 15,
    imageSrc: "https://source.unsplash.com/random/800x600/?job"
  },
  {
    id: 5,
    title: "Inclusive Coding Workshop",
    description: "Learn programming basics in this accessible workshop designed for people with disabilities.",
    date: "July 22, 2023",
    time: "2:00 PM - 5:00 PM",
    location: "Samarthanam Digital Center, Bengaluru",
    category: "Technology",
    volunteersNeeded: 6,
    imageSrc: "https://source.unsplash.com/random/800x600/?coding"
  },
  {
    id: 6,
    title: "Disability Awareness Seminar",
    description: "Join us for an informative seminar on understanding different disabilities and creating inclusive environments.",
    date: "August 5, 2023",
    time: "11:00 AM - 1:00 PM",
    location: "Community Hall, Rajajinagar, Bengaluru",
    category: "Education",
    volunteersNeeded: 4,
    imageSrc: "https://source.unsplash.com/random/800x600/?seminar"
  },
  {
    id: 7,
    title: "Art Therapy Workshop",
    description: "Express yourself through art in this therapeutic workshop led by trained art therapists.",
    date: "August 12, 2023",
    time: "10:00 AM - 12:00 PM",
    location: "Samarthanam Cultural Center, Bengaluru",
    category: "Arts",
    volunteersNeeded: 5,
    imageSrc: "https://source.unsplash.com/random/800x600/?art"
  },
  {
    id: 8,
    title: "Fundraising Gala Dinner",
    description: "Join us for an elegant evening to raise funds for our education programs for visually impaired children.",
    date: "August 20, 2023",
    time: "7:00 PM - 10:00 PM",
    location: "Taj West End, Bengaluru",
    category: "Fundraising",
    volunteersNeeded: 10,
    imageSrc: "https://source.unsplash.com/random/800x600/?gala"
  },
  {
    id: 9,
    title: "Accessible Mobile Apps Workshop",
    description: "Learn how to design and develop accessible mobile applications for people with disabilities.",
    date: "September 2, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "Samarthanam Tech Center, Bengaluru",
    category: "Technology",
    volunteersNeeded: 7,
    imageSrc: "https://source.unsplash.com/random/800x600/?mobile"
  }
];

// Extract unique categories
const categories = Array.from(new Set(allEvents.map(event => event.category)));

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterEvents(term, selectedCategory);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterEvents(searchTerm, value === 'all' ? '' : value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilteredEvents(allEvents);
  };
  
  const filterEvents = (term: string, category: string) => {
    let results = allEvents;
    
    if (term) {
      const lowercaseTerm = term.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(lowercaseTerm) || 
        event.description.toLowerCase().includes(lowercaseTerm) ||
        event.location.toLowerCase().includes(lowercaseTerm)
      );
    }
    
    if (category) {
      results = results.filter(event => event.category === category);
    }
    
    setFilteredEvents(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero 
          title="Upcoming Events" 
          subtitle="Browse and register for our upcoming events. As a volunteer, you can make a significant impact in the lives of those we serve."
          showCta={false}
        />
        
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {/* Search and Filter Controls */}
            <div className="mb-8 p-6 bg-card rounded-xl shadow-sm border border-border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search events by name, description, or location" 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                    aria-label="Search events"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-40 md:w-48" aria-label="Filter by category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(searchTerm || selectedCategory) && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      aria-label="Clear filters"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Active Filters */}
              {(searchTerm || selectedCategory) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center">
                      Search: {searchTerm}
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          filterEvents('', selectedCategory);
                        }} 
                        className="ml-1 hover:text-primary"
                        aria-label="Remove search filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {selectedCategory && (
                    <Badge variant="secondary" className="flex items-center">
                      Category: {selectedCategory}
                      <button 
                        onClick={() => {
                          setSelectedCategory('');
                          filterEvents(searchTerm, '');
                        }} 
                        className="ml-1 hover:text-primary"
                        aria-label="Remove category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EventCard {...event} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria to find events.
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Events;
