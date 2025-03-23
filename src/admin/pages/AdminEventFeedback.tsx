import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import EventFeedbackView from '@/admin/components/EventFeedbackView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';

interface FeedbackItem {
  created_at: string;
  volunteer_id: string;
  event_id: string;
  event_experience: number;
  event_organization: number;
  volunteer_again: number;
  tasks_clear: boolean;
  organizer_support: boolean;
  improvement_suggestions: string;
  impactful_moment: string;
}

interface FeedbackData {
  overallRating: number;
  organizationRating: number;
  volunteerAgainRating: number;
  tasksClear: {
    yes: number;
    no: number;
  };
  organizerSupport: {
    yes: number;
    no: number;
  };
  improvements: string[];
  impactfulMoments: string[];
  totalResponses: number;
}

const AdminEventFeedback = () => {
  // Extract event ID from URL
  const pathname = window.location.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);
  // Get the event ID (second-to-last segment) instead of the last segment
  const eventId = pathSegments[pathSegments.length - 2];
  
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    overallRating: 0,
    organizationRating: 0,
    volunteerAgainRating: 0,
    tasksClear: { yes: 0, no: 0 },
    organizerSupport: { yes: 0, no: 0 },
    improvements: [],
    impactfulMoments: [],
    totalResponses: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setIsLoading(false);
        return;
      }

      // In fetchEventDetails function
try {
  console.log('Fetching event with ID:', eventId);
  
  const { data: eventData, error: eventError } = await supabase
    .from('event')
    .select('title')
    .eq('id', eventId)
    .single();
  
  if (eventError) {
    console.error('Event fetch error:', eventError);
    throw eventError;
  }
  
  console.log('Event data received:', eventData);
  // Rest of the function...

        if (eventData) setEventName(eventData.title);

        // Fetch feedback data for the event
        const { data: feedbackItems, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('event_id', eventId);

        if (feedbackError) throw feedbackError;
        
        if (feedbackItems && feedbackItems.length > 0) {
          processAndSetFeedbackData(feedbackItems);
        } else {
          setError('No feedback found for this event');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load feedback data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, user]);

  const processAndSetFeedbackData = (feedbackItems: FeedbackItem[]) => {
    const totalResponses = feedbackItems.length;
    
    // Calculate average ratings
    const totalExperience = feedbackItems.reduce((sum, item) => sum + (item.event_experience || 0), 0);
    const totalOrganization = feedbackItems.reduce((sum, item) => sum + (item.event_organization || 0), 0);
    const totalVolunteerAgain = feedbackItems.reduce((sum, item) => sum + (item.volunteer_again || 0), 0);
    
    // Count boolean responses
    const tasksClearYes = feedbackItems.filter(item => item.tasks_clear).length;
    const organizerSupportYes = feedbackItems.filter(item => item.organizer_support).length;
    
    // Collect text responses (filter out empty ones)
    const improvements = feedbackItems
      .map(item => item.improvement_suggestions)
      .filter(text => text && text.trim().length > 0);
    
    const impactfulMoments = feedbackItems
      .map(item => item.impactful_moment)
      .filter(text => text && text.trim().length > 0);

    setFeedbackData({
      overallRating: totalExperience / totalResponses,
      organizationRating: totalOrganization / totalResponses,
      volunteerAgainRating: totalVolunteerAgain / totalResponses,
      tasksClear: {
        yes: tasksClearYes,
        no: totalResponses - tasksClearYes
      },
      organizerSupport: {
        yes: organizerSupportYes,
        no: totalResponses - organizerSupportYes
      },
      improvements,
      impactfulMoments,
      totalResponses
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6 flex justify-center items-center">
          <LoadingSpinner size="large" text="Loading feedback data..." />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <EventFeedbackView
        eventName={eventName}
        feedbackData={feedbackData}
      />
    </AdminLayout>
  );
};

export default AdminEventFeedback;