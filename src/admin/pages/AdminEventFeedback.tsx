import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import EventFeedbackView from '@/admin/components/EventFeedbackView';
import LoadingSpinner from '@/components/LoadingSpinner';

interface FeedbackData {
  overallRating: number;
  organizationRating: number;
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
}

// Mock data for development
const MOCK_FEEDBACK_DATA: FeedbackData = {
  overallRating: 8.5,
  organizationRating: 8.2,
  tasksClear: { yes: 8, no: 2 },
  organizerSupport: { yes: 9, no: 1 },
  improvements: [
    "Better communication before the event",
    "More detailed task descriptions",
    "Clearer schedule of activities"
  ],
  impactfulMoments: [
    "Seeing the smiles on children's faces",
    "Working together as a team",
    "The moment when we completed the main activity"
  ]
};

const AdminEventFeedback = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(MOCK_FEEDBACK_DATA);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setEventName('Event Name (Mock Data)');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6 flex justify-center items-center">
          <LoadingSpinner size="large" text="Loading feedback data..." />
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