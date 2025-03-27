import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVolunteerAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { Search, X, ListTodo, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Chatbot from "@/components/chatbot";
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
import LoadingSpinner from '@/components/LoadingSpinner';
import EventDetailsModal from '@/components/EventDetailsModal';

const VolunteerEvents = () => {
  const navigate = useNavigate();
  const { user, logout, registeredEvents } = useVolunteerAuth();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's registered event IDs
      const { data: registrations, error: registrationsError } = await supabase
        .from('event_signup')
        .select('event_id')
        .eq('volunteer_id', user.id);

      if (registrationsError) {
        console.error('Error fetching registrations:', registrationsError);
        toast.error('Failed to load events');
        setLoading(false);
        return;
      }

      const eventIds = registrations.map(reg => reg.event_id);

      // Fetch events with max_volunteers
      const { data: userEvents, error: eventsError } = await supabase
        .from('event')
        .select('*, max_volunteers')
        .in('id', eventIds);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        toast.error('Failed to load events');
        setLoading(false);
        return;
      }

      // Fetch signup counts for these events
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
      const eventsWithCounts = userEvents.map(event => ({
        ...event,
        registered_count: signupData[event.id] || 0,
        remainingSpots: event.max_volunteers ? event.max_volunteers - (signupData[event.id] || 0) : null
      }));

      setEvents(eventsWithCounts);

      // Load feedback status
      const feedbackStatusObj = {};
      for (const event of eventsWithCounts) {
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('*')
          .eq('volunteer_id', user.id)
          .eq('event_id', event.id)
          .maybeSingle();
        feedbackStatusObj[event.id] = !!feedbackData;
      }
      setFeedbackStatus(feedbackStatusObj);

      // Extract unique event types
      const types = [...new Set(eventsWithCounts.map(event => event.category))];
      setEventTypes(types);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigateToEventDetails = (event) => {
    if (feedbackStatus[event.id] && isEventEnded(event.end_date)) {
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleViewTasksOrFeedback = (id, end_date, e) => {
    e.stopPropagation();
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

  const isEventEnded = (end_date) => {
    return new Date(end_date) < new Date();
  };

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
    return (
      <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8 pt-28 flex items-center justify-center">
            <LoadingSpinner size="large" text="Loading your events..." color="primary" />
          </main>
        </div>
      </div>
    );
  }

  const renderCustomButtons = (event) => {
    const isEnded = isEventEnded(event.end_date);
    const hasFeedback = feedbackStatus[event.id];
  
    if (isEnded) {
      if (hasFeedback) {
        return (
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/volunteer/events/${event.id}/certificate`);
              }}
              className="flex items-center bg-yellow-600 hover:bg-yellow-700 justify-center gap-1 text-sm text-white w-full"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Download Certificate</span>
            </Button>
          </div>
        );
      } else {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleViewTasksOrFeedback(event.id, event.end_date, e)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 justify-center gap-1 text-sm text-white w-full"
          >
            <MessageSquare size={16} />
            <span>Provide Feedback</span>
          </Button>
        );
      }
    }
  
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleViewTasksOrFeedback(event.id, event.end_date, e)}
        className="flex items-center bg-green-600 hover:bg-green-700 justify-center gap-1 text-sm text-white w-full"
      >
        <ListTodo size={16} />
        <span>View Tasks</span>
      </Button>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 pt-28">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Registered Events</h1>
              <p className="text-gray-600">View and manage events you've registered for</p>
            </div>
          </div>

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

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                return (
                  <div
                    key={event.id}
                    onClick={() => navigateToEventDetails(event)}
                    className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                  >
                    <EventCard
                      id={event.id.toString()}
                      title={event.title}
                      description={event.description}
                      start_date={event.start_date}
                      end_date={event.end_date}
                      location={event.location}
                      category={event.category}
                      volunteersNeeded={event.max_volunteers}
                      remainingSpots={event.remainingSpots}
                      image_url={event.image_url}
                      isRegistered={true}
                      isRecommended={false}
                      loading={false}
                      customButtons={renderCustomButtons(event)}
                    />
                  </div>
                );
              })}
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
      <div className="flex-grow mt-6">
                <Chatbot />        
      </div>
      <AccessibilityMenu />

      {selectedEvent && (
        <EventDetailsModal
          event={{
            id: selectedEvent.id,
            title: selectedEvent.title,
            description: selectedEvent.description,
            start_date: selectedEvent.start_date,
            end_date: selectedEvent.end_date,
            location: selectedEvent.location,
            category: selectedEvent.category,
            volunteersNeeded: selectedEvent.max_volunteers,
            remainingSpots: selectedEvent.remainingSpots,
            image_url: selectedEvent.image_url
          }}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default VolunteerEvents;