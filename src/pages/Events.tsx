import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Search, X, BellRing, CalendarCheck } from 'lucide-react';
import EventCard from '@/components/EventCard';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useVolunteerAuth } from '@/lib/authContext';
import { checkIfEventIsUpcoming, checkIfEventIsLive } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const Events = () => {
  const navigate = useNavigate();
  const { user, registeredEvents, registerForEvent } = useVolunteerAuth();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Fetch events
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('*, max_volunteers')
        .gt('close_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (eventError) {
        console.error('Error fetching events:', eventError);
        toast.error('Failed to load events');
        setLoading(false);
        return;
      }

      // Fetch signup counts for all event IDs
      const eventIds = eventData.map(event => event.id);
      const { data: signupData, error: signupError } = await supabase
        .from('event_signup')
        .select('event_id')
        .in('event_id', eventIds)
        .then(res => {
          const counts = res.data.reduce((acc, signup) => {
            acc[signup.event_id] = (acc[signup.event_id] || 0) + 1;
            return acc;
          }, {});
          return { data: counts, error: res.error };
        });

      if (signupError) {
        console.error('Error fetching signup counts:', signupError);
        toast.error('Failed to load volunteer counts');
        setLoading(false);
        return;
      }

      // Merge events with signup counts and calculate remaining spots
      const eventsWithCounts = eventData.map(event => ({
        ...event,
        registered_count: signupData[event.id] || 0,
        remaining_spots: event.max_volunteers ? event.max_volunteers - (signupData[event.id] || 0) : null
      }));

      setEvents(eventsWithCounts);

      // Extract unique event types
      const types = [...new Set(eventsWithCounts.map(event => event.category))];
      setEventTypes(types);

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  const handleVolunteerSignup = async (eventId) => {
    if (!user) {
      toast.error('Please log in to register for events');
      navigate('/login');
      return false;
    }

    try {
      const result = await registerForEvent(eventId);
      if (result.success) {
        // Update local state to reflect new registration
        const updatedEvents = events.map(event =>
          event.id === eventId
            ? {
                ...event,
                registered_count: event.registered_count + 1,
                remaining_spots: event.max_volunteers ? event.max_volunteers - (event.registered_count + 1) : null
              }
            : event
        );
        setEvents(updatedEvents);
      }
      return result.success;
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  // Filter functions (unchanged)
  const filterBySearch = (event) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(term) ||
      event.description.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term) ||
      event.category.toLowerCase().includes(term)
    );
  };

  const filterByType = (event) => {
    if (selectedType === 'all') return true;
    return event.category === selectedType;
  };

  const filterByDate = (event) => {
    if (selectedDate === 'all') return true;
    
    const today = new Date();
    const eventStartDate = new Date(event.start_date);
    const eventEndDate = new Date(event.end_date);
    
    if (selectedDate === 'upcoming') {
      return checkIfEventIsUpcoming(event.start_date);
    }
    
    if (selectedDate === 'live') {
      return checkIfEventIsLive(event.start_date, event.end_date);
    }
    
    if (selectedDate === 'past') {
      return eventEndDate < today;
    }
    
    return true;
  };

  const filteredEvents = events.filter(
    event => filterBySearch(event) && filterByType(event) && filterByDate(event)
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDate('all');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6 mt-32">
        {/* Search and Filters (unchanged) */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live Now</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-primary"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="flex items-center">
                  Type: {selectedType}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-1 hover:text-primary"
                    aria-label="Remove type filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {selectedDate !== 'all' && (
                <Badge variant="secondary" className="flex items-center">
                  Date: {selectedDate}
                  <button
                    onClick={() => setSelectedDate('all')}
                    className="ml-1 hover:text-primary"
                    aria-label="Remove date filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id}>
                <EventCard
                  id={event.id.toString()}
                  title={event.title}
                  description={event.description}
                  start_date={event.start_date}
                  end_date={event.end_date}
                  location={event.location}
                  category={event.category}
                  volunteersNeeded={event.max_volunteers} // Updated prop name
                  remainingSpots={event.remaining_spots} // New prop
                  image_url={event.image_url}
                  isRegistered={registeredEvents && registeredEvents[event.id]} 
                  isRecommended={false}
                  loading={false}
                  handleVolunteerSignup={() => handleVolunteerSignup(event.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No events found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
            {searchTerm || selectedType !== 'all' || selectedDate !== 'all' ? (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            ) : null}
          </motion.div>
        )}
      </main>

      <AccessibilityMenu/>
    </div>
  );
};

export default Events;