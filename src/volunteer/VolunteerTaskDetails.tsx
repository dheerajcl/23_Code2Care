import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Calendar, Clock, MapPin, Users, List, Columns, Tag, User2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Task View Components
import TaskTable from '../components/TaskTable';
import TaskKanban from '../components/TaskKanban';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Badge } from '@/components/ui/badge';
import AccessibilityMenu from '@/components/AccessibilityMenu';

// This can be placed in the admin/pages/AdminEvents.js file

export const eventData = [
  {
    id: 1,
    title: "Annual Charity Gala",
    date: "April 15, 2025",
    time: "6:00 PM - 10:00 PM",
    deadline: "April 5, 2025",
    location: "Grand Plaza Hotel, 123 Main St",
    type: "Fundraiser",
    status: "Upcoming",
    organizer: "Sarah Johnson",
    description: "Our flagship fundraising event supporting local education initiatives.",
    volunteerCount: 15,
    taskCount: 24
  },
  {
    id: 2,
    title: "Community Clean-up Day",
    date: "March 28, 2025",
    time: "9:00 AM - 2:00 PM",
    deadline: "March 25, 2025",
    location: "Riverside Park",
    type: "Environmental",
    status: "Upcoming",
    organizer: "Michael Chen",
    description: "Join us in cleaning up our local park and riverside area.",
    volunteerCount: 30,
    taskCount: 12
  },
  {
    id: 3,
    title: "Food Drive",
    date: "May 10, 2025",
    time: "10:00 AM - 4:00 PM",
    deadline: "May 1, 2025",
    location: "Community Center, 456 Oak Avenue",
    type: "Humanitarian",
    status: "Planning",
    organizer: "Lisa Nguyen",
    description: "Collecting non-perishable food items for local food banks.",
    volunteerCount: 20,
    taskCount: 15
  },
  {
    id: 4,
    title: "Senior Tech Workshop",
    date: "April 5, 2025",
    time: "1:00 PM - 3:00 PM",
    deadline: "March 29, 2025",
    location: "Senior Living Center, 789 Elm Street",
    type: "Educational",
    status: "Upcoming",
    organizer: "David Williams",
    description: "Teaching seniors basic computer and smartphone skills.",
    volunteerCount: 8,
    taskCount: 10
  },
  {
    id: 5,
    title: "5K Fun Run for Youth Programs",
    date: "June 12, 2025",
    time: "8:00 AM - 11:00 AM",
    deadline: "June 1, 2025",
    location: "City Park Trail",
    type: "Fundraiser",
    status: "Planning",
    organizer: "Robert Torres",
    description: "Annual run/walk event raising funds for after-school programs.",
    volunteerCount: 25,
    taskCount: 20
  }
];

const VolunteerTaskDetails = () => {
  const [activeView, setActiveView] = useState('table');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();

  // Event data for the specific ID
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // Store tasks assigned to the current volunteer for this event
  const [volunteerTasks, setVolunteerTasks] = useState([]);

  // Dummy data for tasks with eventId and assignee fields
  const tasks = [
    { 
      id: 1, 
      name: 'Confirm venue reservation', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Backlog',
      dueDate: 'March 2, 2025',
      eventId: 1
    },
    { 
      id: 2, 
      name: 'Arrange catering services', 
      assignee: { id: 2, name: 'Antonio', initial: 'A' }, 
      status: 'In Progress',
      dueDate: 'April 3, 2025',
      eventId: 1
    },
    { 
      id: 3, 
      name: 'Send invitations', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Todo',
      dueDate: 'March 23, 2025',
      eventId: 1
    },
    { 
      id: 4, 
      name: 'Schedule volunteers', 
      assignee: { id: 1, name: 'John', initial: 'J' }, 
      status: 'Done',
      dueDate: 'March 25, 2025',
      eventId: 2
    },
    { 
      id: 5, 
      name: 'Prepare event materials', 
      assignee: { id: 2, name: 'Antonio', initial: 'A' }, 
      status: 'In Review',
      dueDate: 'April 5, 2025',
      eventId: 2
    }
  ];

  useEffect(() => {
    if (id) {
      // Fetch event data based on ID
      const event_data = eventData.find(e => e.id === parseInt(id));
      setEvent(event_data);
      
      // Use ID 1 from the dummy data (John's ID)
      const dummyUserId = 1;
      
      // Filter tasks for this specific event AND assigned to our dummy user
      const filteredTasks = tasks.filter(
        task => task.eventId === parseInt(id) && task.assignee?.id === dummyUserId
      );
      
      setVolunteerTasks(filteredTasks);
      setLoading(false);
    }
  }, [id, user]);

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  // Function to update task status
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = volunteerTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setVolunteerTasks(updatedTasks);
    
    // Here you would normally make an API call to update the task status
    console.log(`Task ${taskId} status updated to ${newStatus}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8 pt-28">
          {/* Event Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <button 
                  onClick={() => navigate('/volunteer/events')}
                  className="hover:text-red-700 transition-colors dark:text-white high-contrast:text-white"
                >
                  Events
                </button>
                <span className='dark:text-white high-contrast:text-white'>/</span>
                <span className="text-gray-700 dark:text-white high-contrast:text-white">{event?.title}</span>
              </div>
              <h1 className="text-3xl font-bold dark:text-white high-contrast:text-white">{event?.title}</h1>
            </div>
          </div>

          {/* Event Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 event-info-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <Calendar size={16} />
                  Date & Time
                </span>
                <span className="text-md font-medium dark:text-white high-contrast:text-white">{event?.date}</span>
                <span className="text-sm text-gray-600">{event?.time}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <Calendar size={16} />
                  Deadline
                </span>
                <span className="text-md font-medium dark:text-white high-contrast:text-white">{event?.deadline}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="text-md font-medium dark:text-white high-contrast:text-white">{event?.location}</span>
              </div>
              
              <div className="flex flex-col ml-16">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <Tag size={16} />
                  Event Type
                </span>
                <div className="mt-1">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 font-medium">
                    {event?.type || "Uncategorized"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* My Tasks Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
            
            {/* View Selector */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex bg-gray-200 rounded-lg p-1 event-info-card">
              <button 
                onClick={() => setActiveView('table')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeView === 'table' 
                    ? 'bg-white shadow event-info-card-toggle' 
                    : 'hover:bg-gray-300 dark:hover:bg-transparent dark:hover:bg-red-950'
                }`}
              >
                <List size={18} />
                <span>Table</span>
              </button>

              <button 
                onClick={() => setActiveView('kanban')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeView === 'kanban' 
                    ? 'bg-white shadow event-info-card-toggle' 
                    : 'hover:bg-gray-300 dark:hover:bg-transparent dark:hover:bg-red-950'
                }`}
              >
                <Columns size={18} />
                <span>Kanban</span>
              </button>
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors event-info-card">
                Filter
              </button>
            </div>

            {/* Task Views */}
            <div className="bg-white rounded-lg shadow event-info-card">
              {volunteerTasks.length > 0 ? (
                activeView === 'table' ? (
                  <TaskTable 
                    tasks={volunteerTasks} 
                    onUpdateStatus={handleUpdateTaskStatus} 
                  />
                ) : (
                  <TaskKanban 
                    tasks={volunteerTasks} 
                    onUpdateStatus={handleUpdateTaskStatus} 
                  />
                )
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className='dark:text-white high-contrast:text-white'>You don't have any tasks assigned for this event.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default VolunteerTaskDetails;