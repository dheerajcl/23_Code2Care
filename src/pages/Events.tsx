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
  }, [user]); // Re-fetch when user changes (login/logout)

  const fetchEvents = async () => {
    try {
      setLoading(true);
     
const { data, error } = await supabase
.from('event')
.select('*')
.order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        setLoading(false);
        return;
      }

      setEvents(data || []);

      // Extract unique event types
      const types = [...new Set(data.map(event => event.category))];
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
      // Use registerForEvent from context
      return await registerForEvent(eventId);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  };

  // Filter functions
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
        {/* Search and Filters */}
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
              
              {(searchTerm || selectedType !== 'all') && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Date Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedDate === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedDate('all')}
            >
              All Events
            </Button>
            <Button 
              variant={selectedDate === 'upcoming' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedDate('upcoming')}
            >
              Upcoming
            </Button>
            <Button 
              variant={selectedDate === 'live' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedDate('live')}
            >
              Live Now
            </Button>
            <Button 
              variant={selectedDate === 'past' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedDate('past')}
            >
              Past Events
            </Button>
          </div>
          
          {(searchTerm || selectedType !== 'all') && (
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
            {searchTerm || selectedType !== 'all' ? (
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
