import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { Search, X, ListTodo, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
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
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import EventCard from '../components/EventCard';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const VolunteerEvents = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  // Track events the user has volunteered for
  const [myVolunteering, setMyVolunteering] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        // First, fetch the user's signup events
        const { data: signupData, error: signupError } = await supabase
          .from('event_signup')
          .select('*')
          .eq('volunteer_id', user.id);

        if (signupError) throw signupError;
        setMyVolunteering(signupData);
        
        // If the user has signed up for events, fetch only those events
        if (signupData && signupData.length > 0) {
          const eventIds = signupData.map(signup => signup.event_id);
          
          const { data: eventsData, error: eventsError } = await supabase
            .from('event')
            .select('*')
            .in('id', eventIds);

          if (eventsError) throw eventsError;
          
          // Extract unique event types
          const types = [...new Set(eventsData.map(event => event.category))];
          setEventTypes(types);
          setEvents(eventsData);
        } else {
          // User hasn't registered for any events
          setEvents([]);
          setEventTypes([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load registered events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  const navigateToEventDetails = (id) => {
    navigate(`/volunteer/events/${id}`);
  };

  const handleViewTasksOrFeedback = (id, end_date, e) => {
    e.stopPropagation();
    
    // Check if event has ended (end_date is before now)
    const isEventEnded = new Date(end_date) < new Date();
    
    if (isEventEnded) {
      navigate(`/volunteer/events/${id}/feedback`);
    } else {
      navigate(`/volunteer/events/${id}/tasks`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDate('all');
  };

  // Check if event is in the past
  const isEventEnded = (end_date) => {
    return new Date(end_date) < new Date();
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      event.category === selectedType;
    
    const matchesDate = selectedDate === 'all' || 
      (selectedDate === 'upcoming' && new Date(event.end_date) >= new Date()) ||
      (selectedDate === 'past' && new Date(event.end_date) < new Date()) ||
      (selectedDate === 'thisMonth' && new Date(event.start_date).getMonth() === new Date().getMonth()) ||
      (selectedDate === 'nextMonth' && new Date(event.start_date).getMonth() === (new Date().getMonth() + 1) % 12);
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  // Custom buttons for EventCard
  const renderCustomButtons = (event) => {
    const isEnded = isEventEnded(event.end_date);
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleViewTasksOrFeedback(event.id, event.end_date, e)}
        className={`flex items-center ${isEnded ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} justify-center gap-1 text-sm text-white w-full`}
      >
        {isEnded ? (
          <>
            <MessageSquare size={16} />
            <span>Provide Feedback</span>
          </>
        ) : (
          <>
            <ListTodo size={16} />
            <span>View Tasks</span>
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header/>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 pt-28">
          {/* Events Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Registered Events</h1>
              <p className="text-gray-600">View and manage events you've registered for</p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="bg-card rounded-xl shadow-sm border border-border mb-8 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search your registered events" 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                  aria-label="Search events"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-40" aria-label="Filter by date">
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="nextMonth">Next Month</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
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
            {(searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
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
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} onClick={() => navigateToEventDetails(event.id)}>
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
                    isRegistered={true}
                    isRecommended={false}
                    loading={false}
                    customButtons={renderCustomButtons(event)}
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
              <h3 className="text-xl font-medium mb-2">No registered events found</h3>
              <p className="text-gray-500">
                {events.length === 0 ? 
                  "You haven't registered for any events yet." : 
                  "Try adjusting your search or filter criteria."}
              </p>
              {events.length > 0 && (searchTerm || selectedType !== 'all' || selectedDate !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
              <Button 
                variant="default"
                onClick={() => navigate('/events')}
                className="mt-4 ml-2"
              >
                Browse Available Events
              </Button>
            </motion.div>
          )}
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default VolunteerEvents;
