import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Calendar, Clock, MapPin, Users, Plus, List, Columns } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Task View Components
import TaskTable from '../components/AdminTaskTable';
import TaskKanban from '../components/AdminTaskKanban';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

const AdminEventDetails = () => {
  const [activeView, setActiveView] = useState('table');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();

  // Event data for the specific ID
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy data for tasks
  const tasks = [
    { 
      id: 1, 
      name: 'Confirm venue reservation', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Backlog',
      dueDate: 'March 2, 2025'
    },
    { 
      id: 2, 
      name: 'Arrange catering services', 
      assignee: { id: 2, name: 'Antonio', initial: 'A' }, 
      status: 'In Progress',
      dueDate: 'April 3, 2025'
    },
    { 
      id: 3, 
      name: 'Send invitations', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Todo',
      dueDate: 'March 23, 2025'
    },
    { 
      id: 4, 
      name: 'Schedule volunteers', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Done',
      dueDate: 'March 25, 2025'
    },
    { 
      id: 5, 
      name: 'Prepare event materials', 
      assignee: { id: 2, name: 'Antonio', initial: 'A' }, 
      status: 'In Review',
      dueDate: 'April 5, 2025'
    },
    { 
      id: 6, 
      name: 'Setup registration page', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Backlog',
      dueDate: 'March 1, 2025'
    }
  ];

  // Event data based on IDs from the previous page
  const eventDatabase = [
    { 
      id: 1, 
      title: "Community Cleanup", 
      date: "April 10, 2025", 
      location: "Central Park", 
      registrations: 45,
      description: "A community initiative to clean and beautify our local park areas. Volunteers will work together to collect trash, plant flowers, and restore park benches.",
      organizer: "Environmental Protection Group"
    },
    { 
      id: 2, 
      title: "Charity Fundraiser", 
      date: "April 15, 2025", 
      location: "City Hall", 
      registrations: 78,
      description: "An evening of entertainment and auctions to raise funds for children's education programs in underserved communities.",
      organizer: "Education For All Foundation"
    },
    { 
      id: 3, 
      title: "Workshop Series", 
      date: "April 25, 2025", 
      location: "Community Center", 
      registrations: 32,
      description: "A series of professional development workshops focusing on career advancement skills, resume building, and interview techniques.",
      organizer: "Career Development Network"
    },
    { 
      id: 4, 
      title: "Blood Donation Drive", 
      date: "March 21, 2025", 
      location: "Downtown Hospital", 
      participants: 56,
      description: "A critical blood donation initiative in partnership with the regional blood bank to address shortages in blood supply.",
      organizer: "Healthcare Alliance"
    },
    { 
      id: 5, 
      title: "Winter Coat Drive", 
      date: "February 15, 2025", 
      location: "Main Street", 
      participants: 123,
      description: "Collection of winter coats and warm clothing for distribution to homeless shelters and families in need during the winter season.",
      organizer: "Community Outreach Program"
    }
  ];

  // Task statistics
  const totalTasks = tasks.length;
  const assignedTasks = tasks.filter(task => task.assignee).length;
  const incompleteTasks = tasks.filter(task => task.status !== 'Done').length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const overdueTasks = tasks.filter(task => task.status === 'Backlog').length; // Count 'Backlog' tasks as overdue

  useEffect(() => {
    if (id) {
      // Fetch event data based on ID
      const eventData = eventDatabase.find(e => e.id === parseInt(id));
      setEvent(eventData);
      setLoading(false);
    }
  }, [id]);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <AdminHeader user={user} handleLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-8">
          {/* Event Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <button 
                  onClick={() => navigate('/admin/events')}
                  className="hover:text-red-700 transition-colors"
                >
                  Events
                </button>
                <span>/</span>
                <span className="text-gray-700">{event?.title}</span>
              </div>
              <h1 className="text-3xl font-bold">{event?.title}</h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span>Edit Event</span>
              </button>
              <button className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
                <Plus size={20} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar size={16} />
                  Date
                </span>
                <span className="text-lg font-medium">{event?.date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="text-lg font-medium">{event?.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <Users size={16} />
                  Registrations
                </span>
                <span className="text-lg font-medium">{event?.registrations || event?.participants}</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-gray-500 mb-1">Description</h3>
              <p className="text-gray-800">{event?.description}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 mb-1">Organizer</h3>
              <p className="text-gray-800">{event?.organizer}</p>
            </div>
          </div>

              {/* Task Management */}
<div className="mb-8">
  <h2 className="text-2xl font-bold mb-6">Event Tasks</h2>
  
      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center items-center border-t-4 border-blue-500">
          <div className="bg-blue-100 p-2 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Total Tasks</span>
          <span className="text-3xl font-bold text-blue-500">{totalTasks}</span>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center items-center border-t-4 border-purple-500">
          <div className="bg-purple-100 p-2 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Assigned Tasks</span>
          <span className="text-3xl font-bold text-purple-500">{assignedTasks}</span>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center items-center border-t-4 border-yellow-500">
          <div className="bg-yellow-100 p-2 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Incomplete Tasks</span>
          <span className="text-3xl font-bold text-yellow-500">{incompleteTasks}</span>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center items-center border-t-4 border-green-500">
          <div className="bg-green-100 p-2 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Completed Tasks</span>
          <span className="text-3xl font-bold text-green-500">{completedTasks}</span>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center items-center border-t-4 border-red-500">
          <div className="bg-red-100 p-2 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm">Overdue Tasks</span>
          <span className="text-3xl font-bold text-red-500">{overdueTasks}</span>
        </div>
      </div>
            
            {/* View Selector */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button 
                  onClick={() => setActiveView('table')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeView === 'table' ? 'bg-white shadow' : 'hover:bg-gray-300'
                  }`}
                >
                  <List size={18} />
                  <span>Table</span>
                </button>
                <button 
                  onClick={() => setActiveView('kanban')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeView === 'kanban' ? 'bg-white shadow' : 'hover:bg-gray-300'
                  }`}
                >
                  <Columns size={18} />
                  <span>Kanban</span>
                </button>
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Filter
              </button>
            </div>

            {/* Task Views */}
            <div className="bg-white rounded-lg shadow">
              {activeView === 'table' ? (
                <TaskTable tasks={tasks} />
              ) : (
                <TaskKanban tasks={tasks} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminEventDetails;