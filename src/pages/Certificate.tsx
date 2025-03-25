import { CertificateView } from '../components/CertificateView';
import { useParams } from 'react-router-dom';
import { useVolunteerAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { VolunteerLayout } from '../components/layouts/VolunteerLayout';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export const CertificatePage = () => {
  const { volunteerId, eventId } = useParams();
  const { user } = useVolunteerAuth();
  const [loading, setLoading] = useState(true);
  const [volunteerData, setVolunteerData] = useState({
    name: '',
    hours: 0,
    eventName: '',
    eventDate: ''
  });

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        
        // Fetch volunteer details
        const { data: volunteer, error: volunteerError } = await supabase
          .from('volunteers')
          .select('name')
          .eq('id', volunteerId || user?.id)
          .single();

        if (volunteerError) throw volunteerError;

        // Fetch event details
        const { data: event, error: eventError } = await supabase
          .from('event')
          .select('title, end_date')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Fetch volunteer hours for this event
        const { data: hoursData, error: hoursError } = await supabase
          .from('volunteer_hours')
          .select('hours')
          .eq('volunteer_id', volunteerId || user?.id)
          .eq('event_id', eventId)
          .single();

        if (hoursError) throw hoursError;

        setVolunteerData({
          name: volunteer?.name || user?.name || 'Volunteer',
          hours: hoursData?.hours || 0,
          eventName: event?.title || 'Event',
          eventDate: event?.end_date || new Date().toISOString()
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching certificate data:', error);
        toast.error('Failed to load certificate data');
        setLoading(false);
      }
    };

    if (user) {
      fetchCertificateData();
    }
  }, [user, volunteerId, eventId]);

  if (loading) {
    return (
      <VolunteerLayout>
          <LoadingSpinner size="large" text="Loading certificate..." />
      </VolunteerLayout>
    );
  }

  return (
    <VolunteerLayout>
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <CertificateView 
            volunteerData={{
              name: user?.firstName,
              hours: volunteerData.hours,
              eventName: volunteerData.eventName,
              eventDate: volunteerData.eventDate
            }} 
          />
        </div>
      </div>
      <AccessibilityMenu/>
    </VolunteerLayout>
  );
};