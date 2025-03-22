import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Calendar, Clock, MapPin, Users, List, Columns, Tag, User2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventData } from '../admin/pages/AdminEvents'; // Reusing the same event data source

// Task View Components
import TaskTable from '../components/TaskTable';
import TaskKanban from '../components/TaskKanban';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Badge } from '@/components/ui/badge';

const VolunteerTasks = () => {
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
    <div className="h-screen bg-gray-100 flex flex-col">
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
                  className="hover:text-red-700 transition-colors"
                >
                  Events
                </button>
                <span>/</span>
                <span className="text-gray-700">{event?.title}</span>
              </div>
              <h1 className="text-3xl font-bold">{event?.title}</h1>
            </div>
          </div>

          {/* Event Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar size={16} />
                  Date & Time
                </span>
                <span className="text-md font-medium">{event?.date}</span>
                <span className="text-sm text-gray-600">{event?.time}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar size={16} />
                  Deadline
                </span>
                <span className="text-md font-medium">{event?.deadline}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="text-md font-medium">{event?.location}</span>
              </div>
              
              <div className="flex flex-col ml-16">
                <span className="text-gray-500 mb-1 flex items-center gap-2">
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
  
            {event?.organizer && (
              <div className="mt-6 flex items-center">
                <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                  <User2 size={18} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Organizer</h3>
                  <p className="text-gray-800 font-medium">{event?.organizer}</p>
                </div>
              </div>
            )}
          </div>

          {/* My Tasks Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
            
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
                  <p>You don't have any tasks assigned for this event.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VolunteerTasks;