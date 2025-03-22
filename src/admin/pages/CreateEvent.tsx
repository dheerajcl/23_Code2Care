import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminEventForm from '../components/AdminEventForm';

const CreateEvent = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Create Event" user={auth.user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <AdminEventForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateEvent; 