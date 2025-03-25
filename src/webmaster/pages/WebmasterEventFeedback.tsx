import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getEventById, getEventFeedback } from '@/services/database.service';
import { format } from 'date-fns';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export const WebmasterEventFeedback: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useWebmasterAuth();
  
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState({
    averageRating: 0,
    counts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    totalCount: 0
  });
  
  useEffect(() => {
    const fetchEventAndFeedback = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Get event details
        const { data: eventData, error: eventError } = await getEventById(id);
        if (eventError) throw eventError;
        // console.log(eventData);
        if (eventData) {
          setEvent(eventData);
        } else {
          throw new Error('Event not found');
        }
        
        // Get feedback for the event
        const { data: feedbackData, error: feedbackError } = await getEventFeedback(id);
        if (feedbackError) throw feedbackError;
        // console.log(feedbackData);
        if (feedbackData) {
          setFeedback(feedbackData);
          
          // Calculate feedback statistics
          calculateFeedbackStats(feedbackData);
        }
      } catch (err) {
        console.error('Error fetching event feedback:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndFeedback();
  }, [id]);
  
  const calculateFeedbackStats = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      setFeedbackStats({
        averageRating: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        totalCount: 0
      });
      return;
    }
    
    // Initialize counts
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    feedbackData.forEach(item => {
      // Calculate the average rating for this feedback
      const rating = (item.event_experience + item.event_organization + item.volunteer_again) / 6;
      
      // Round to nearest integer and clamp between 1 and 5
      const roundedRating = Math.min(5, Math.max(1, Math.round(rating)));
      
      counts[roundedRating] += 1;
    });
    
    // Calculate average
    const totalRating = feedbackData.reduce((sum, item) => {
      return sum + (item.event_experience + item.event_organization + item.volunteer_again) / 6;
    }, 0);
    
    const totalCount = feedbackData.length;
    const averageRating = totalCount > 0 ? totalRating / totalCount : 0;
    setFeedbackStats({
      averageRating,
      counts,
      totalCount
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'Time not available';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Invalid time';
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(`/webmaster/events/${id}`);
  };
  
  // Render stars for ratings
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  
  // Get the percentage for a rating
  const getRatingPercentage = (rating) => {
    if (feedbackStats.totalCount === 0) return 0;
    return (feedbackStats.counts[rating] / feedbackStats.totalCount) * 100;
  };
  
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading event feedback...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleBack}>
                Return to Event Details
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center py-10">
              <h3 className="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
              <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist or has been deleted.</p>
              <div className="mt-6">
                <Button onClick={() => navigate('/webmaster/events')}>
                  Back to Events
                </Button>
              </div>
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
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className="-ml-3 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Event Details
              </Button>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
                  <p className="text-gray-500">{event.title}</p>
                </div>
                
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Read-only View
                </Badge>
              </div>
            </div>
            
            {/* Event Summary */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">Date</span>
                    </div>
                    <p className="font-medium">{formatDate(event.start_date)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">Time</span>
                    </div>
                    <p className="font-medium">
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">Location</span>
                    </div>
                    <p className="font-medium">{event.location || 'No location specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedback Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                  <CardDescription>
                    Based on {feedbackStats.totalCount} {feedbackStats.totalCount === 1 ? 'response' : 'responses'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {feedbackStats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex mb-4">
                      {renderStars(Math.round(feedbackStats.averageRating))}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Rating breakdown */}
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center w-20">
                          <span className="text-sm font-medium mr-2">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <Progress 
                            value={getRatingPercentage(rating)} 
                            className="h-2" 
                          />
                        </div>
                        <div className="w-12 text-right text-sm text-gray-500">
                          {feedbackStats.counts[rating]}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Feedback List</CardTitle>
                  <CardDescription>
                    Individual feedback from volunteers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feedback.length > 0 ? (
                    <div className="space-y-6">
                      {feedback.map((item) => (
                        <div key={item.id} className="border-b pb-4 mb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-gray-600">
                                  {item.volunteer?.first_name?.charAt(0) || 'V'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {item.volunteer?.first_name || 'Anonymous'} {item.volunteer?.last_name || ''}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.created_at ? formatDate(item.created_at) : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {renderStars((item.event_experience/2+item.event_organization/2+item.volunteer_again/2)/3 || 0)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            <b>'Suggest to improve: '</b>{item.improvement_suggestions}
                            <br></br>
                            <b>'Impactful moment: '</b>{item.impactful_moment || 'No comments provided'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No feedback has been provided for this event yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
}; 