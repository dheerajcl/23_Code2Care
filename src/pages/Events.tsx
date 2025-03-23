import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import Hero from '../components/Hero';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import LandingHeader from '@/components/LandingHeader';
import AccessibilityMenu from '@/components/AccessibilityMenu';
// Events Component
const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      
      const { data, error } = await supabase
  .from('event')
  .select('*')
  .eq('status', 'scheduled');

      if (error) {
        console.error('Error fetching events:', error.message);
        setError('Failed to load events. Please try again later.');
      } else {
        setEvents(data);
        setFilteredEvents(data);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(events.map(event => event.category)));

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterEvents(term, selectedCategory);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterEvents(searchTerm, value === 'all' ? '' : value);
  };

  // Filter events
  const filterEvents = (term: string, category: string) => {
    let results = events;

    if (term) {
      results = results.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }

    if (category) {
      results = results.filter(event => event.category === category);
    }

    setFilteredEvents(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-grow">
        <Hero
          title="Upcoming Events"
          subtitle="Browse and register for our upcoming events. Make an impact by volunteering!"
          showCta={false}
        />

        <section className="py-16 px-4">
          <div className="container mx-auto">
            {/* Search and Filter Controls */}
            <div className="mb-8 p-6 bg-card rounded-xl shadow-sm border border-border">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                    aria-label="Search events"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setFilteredEvents(events);
                }}>
                  Reset
                </Button>
              </div>
            </div>

            {/* Event List */}
            {loading ? (
              <p className="text-center text-muted-foreground">Loading events...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground">No events found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            )}
          </div>
        </section>
        <AccessibilityMenu/>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
