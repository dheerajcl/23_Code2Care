import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminEventForm from '../components/AdminEventForm';
import { getEventById } from '@/services/database.service';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AccessibilityMenu from '@/components/AccessibilityMenu';

const EditEvent = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await getEventById(id);
        
        if (error) throw error;
        if (!data) throw new Error('Event not found');
        
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event');
        toast({
          title: "Error",
          description: err.message || 'Failed to load event',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <AdminHeader title="Edit Event" user={auth.user} onLogout={handleLogout} /> */}
          
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-lg">Loading event...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <AdminHeader title="Edit Event" user={auth.user} onLogout={handleLogout} /> */}
          
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Event</h2>
              <p className="mb-4 text-gray-600">{error || 'Could not load the event details.'}</p>
              <Button onClick={() => navigate('/admin/events')}>
                Return to Events
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <AdminHeader title="Edit Event" user={auth.user} onLogout={handleLogout} /> */}
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Event: {event.title}</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <AdminEventForm initialData={event} isEditing={true} />
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default EditEvent; 