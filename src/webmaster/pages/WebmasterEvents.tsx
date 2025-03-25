import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { List, Calendar, MapPin, Users, Search, X } from 'lucide-react';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { motion } from 'framer-motion';
import { getEvents } from '@/services/database.service';
import { format } from 'date-fns';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export const WebmasterEvents: React.FC = () => {
  const navigate = useNavigate();
  const auth = useWebmasterAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getEvents();
      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term, type filter, or date filter changes
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter if selected
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(event => {
        // Handle the case where event might not have a category or it's stored in a different field
        const eventType = event.category || event.status || "Uncategorized";
        return eventType.toLowerCase() === typeFilter.toLowerCase();
      });
    }

    // Apply date filter if selected
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);

        if (dateFilter === 'upcoming' && eventDate >= today) {
          return true;
        }
        if (dateFilter === 'thisWeek' && eventDate >= today && eventDate <= nextWeek) {
          return true;
        }
        if (dateFilter === 'thisMonth' && eventDate >= today && eventDate <= nextMonth) {
          return true;
        }
        if (dateFilter === 'past' && eventDate < today) {
          return true;
        }
        return false;
      });
    }

    setFilteredEvents(filtered);
  }, [searchTerm, typeFilter, dateFilter, events]);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/webmaster/login');
  };

  const navigateToEventDetails = (id) => {
    navigate(`/webmaster/events/${id}`);
  };

  const handleViewDetails = (id, e) => {
    e.stopPropagation();
    navigate(`/webmaster/events/${id}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
  };

  // Function to get all unique categories from events
  const getEventCategories = () => {
    const categories = events
      .map(event => event.category || event.status || "Uncategorized")
      .filter((value, index, self) => self.indexOf(value) === index);
    return categories;
  };

  // Function to format date for display
  const formatEventDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (err) {
      return "Invalid date";
    }
  };

  // Function to format time for display
  const formatEventTime = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    } catch (err) {
      return "Time not specified";
    }
  };
  
  // Function to check if an event has ended
  const isEventEnded = (event) => {
    if (!event || !event.end_date) return false;
    return new Date(event.end_date) < new Date();
  };

  // Function to get a default image if none is provided
  const getEventImage = (event) => {
    if (event.image_url) {
      return event.image_url;
    }
    // Return a placeholder image URL
    return 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <WebmasterSidebar />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <Badge className="w-fit">
                {filteredEvents.length} Total
              </Badge>
            </div>
            
            {/* Read-only notice */}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
              Read-only View
            </Badge>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search events by title, description, or location..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getEventCategories().map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (
                  <Button variant="outline" onClick={clearFilters} className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading events...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={fetchEvents}>
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all'
                  ? "No events match your current filters. Try adjusting your search criteria."
                  : "There are no events in the system yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => navigateToEventDetails(event.id)}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getEventImage(event)}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Badge className="bg-white text-gray-800 hover:bg-gray-100">
                        {event.category || event.status || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>

                    <div className="flex items-start gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">{formatEventDate(event.start_date)}</p>
                        <p className="text-xs text-gray-500">{formatEventTime(event.start_date, event.end_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-1">{event.location}</p>
                    </div>
                    <h4 className="text-sm font-semibold">Event Description</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>

                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={(e) => handleViewDetails(event.id, e)}
                      >
                        <List className="h-4 w-4 mr-1" />
                        Details
                      </Button>

                      <div className="flex gap-1">
                        {isEventEnded(event) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              navigate(`/webmaster/events/${event.id}/feedback`);
                            }}
                          >
                            View Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
}; 