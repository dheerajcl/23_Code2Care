import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Star, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export const WebmasterFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWebmasterAuth();
  
  // State for feedback data
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoading(true);
        
        // Get feedback with event and volunteer info
        const { data, error } = await supabase
          .from('feedback')
          .select(`
            *,
            event:event_id (
              id,
              title,
              start_date
            ),
            volunteer:volunteer_id (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Process data
          const processedFeedback = data.map(item => ({
            id: item.id,
            eventId: item.event_id,
            eventTitle: item.event?.title || 'Unknown Event',
            eventDate: item.event?.start_date || null,
            volunteerId: item.volunteer_id,
            volunteerName: item.volunteer ? `${item.volunteer.first_name || ''} ${item.volunteer.last_name || ''}`.trim() : 'Unknown Volunteer',
            volunteerEmail: item.volunteer?.email || '',
            rating: item.event_experience/2 || 0,
            organizationRating: item.event_organization/2 || 0,
            volunteerAgain: item.volunteer_again/2 || 0,
            tasksClear: item.tasks_clear,
            organizerSupport: item.organizer_support,
            improvementSuggestions: item.improvement_suggestions || 'N/A',
            impactfulMoment: item.impactful_moment || 'N/A',
            createdAt: item.created_at || new Date().toISOString()
          }));
          
          setFeedback(processedFeedback);
          setFilteredFeedback(processedFeedback);
          
          // Get unique events for filtering
          const uniqueEvents = [...new Set(processedFeedback.map(item => item.eventId))]
            .map(eventId => {
              const item = processedFeedback.find(f => f.eventId === eventId);
              return {
                id: eventId,
                title: item.eventTitle
              };
            });
          setEvents(uniqueEvents);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load feedback data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeedback();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    if (feedback.length === 0) return;
    
    let filtered = [...feedback];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.eventTitle.toLowerCase().includes(term) ||
        item.volunteerName.toLowerCase().includes(term) ||
        item.improvementSuggestions.toLowerCase().includes(term) ||
        item.impactfulMoment.toLowerCase().includes(term)
      );
    }
    
    // Apply event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(item => item.eventId === eventFilter);
    }
    
    // Apply rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter, 10);
      filtered = filtered.filter(item => item.rating === rating);
    }
    
    setFilteredFeedback(filtered);
  }, [searchTerm, eventFilter, ratingFilter, feedback]);
  
  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle filters display
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Render stars for rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading feedback data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <WebmasterSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500">View all feedback submitted by event participants</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Read-only View
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search feedback by event, volunteer, or content..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={toggleFilters}
                  className="flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {showFilters ? 
                    <ChevronUp className="ml-2 h-4 w-4" /> : 
                    <ChevronDown className="ml-2 h-4 w-4" />
                  }
                </Button>
              </div>
              
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Filter by Event</h3>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                      >
                        <option value="all">All Events</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Rating Filter */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Filter by Rating</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          key="all"
                          variant={ratingFilter === 'all' ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setRatingFilter('all')}
                        >
                          All Ratings
                        </Badge>
                        {[5, 4, 3, 2, 1].map(rating => (
                          <Badge
                            key={rating}
                            variant={ratingFilter === rating.toString() ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setRatingFilter(rating.toString())}
                          >
                            {rating} {rating === 1 ? 'Star' : 'Stars'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Feedback Cards */}
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">No feedback found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedback.map(item => (
                  <Card key={item.id} className="bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.eventTitle}</CardTitle>
                          <CardDescription>{formatDate(item.eventDate)}</CardDescription>
                        </div>
                        <div className="flex">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">From: {item.volunteerName}</p>
                        <p className="text-sm text-gray-500">Submitted: {formatDate(item.createdAt)}</p>
                      </div>
                      
                      {item.impactfulMoment && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">Most Impactful Moment</h4>
                          <p className="text-gray-700">{item.impactfulMoment}</p>
                        </div>
                      )}
                      
                      {item.improvementSuggestions && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">Improvement Suggestions</h4>
                          <p className="text-gray-700">{item.improvementSuggestions}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Tasks Clear?</h4>
                          <Badge variant={item.tasksClear ? 'success' : 'destructive'}>
                            {item.tasksClear ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Organizer Support?</h4>
                          <Badge variant={item.organizerSupport ? 'success' : 'destructive'}>
                            {item.organizerSupport ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/webmaster/events/${item.eventId}/feedback`)}
                        >
                          View All Feedback for This Event
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
}; 