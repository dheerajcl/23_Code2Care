import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Calendar, Clock, MapPin, Users, List, Columns, Tag, User2, Check, X, Info } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Task View Components
import TaskTable from '../components/TaskTable';
import TaskKanban from '../components/TaskKanban';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { getEventById, getTasksForVolunteer } from '@/services/database.service';
import { notificationService } from '@/services/notification.service';
import { pointsService } from '@/services/points.service';

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
  // Task that needs response (pending invitations)
  const [pendingInvitations, setPendingInvitations] = useState([]);

  useEffect(() => {
    if (id && user?.id) {
      fetchEventAndTasks();
    }
  }, [id, user]);

  const fetchEventAndTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const { data: eventData, error: eventError } = await getEventById(id);
      
      if (eventError) {
        console.error('Error fetching event details:', eventError);
        toast.error('Failed to load event details');
        return;
      }
      
      if (!eventData) {
        toast.error('Event not found');
        navigate('/volunteer/events');
        return;
      }
      
      setEvent(eventData);
      
      // Fetch tasks assigned to the volunteer for this event
      const { data: tasksData, error: tasksError } = await getTasksForVolunteer(user.id);
      
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        toast.error('Failed to load tasks');
        return;
      }
      
      // Filter tasks for the current event
      const eventTasks = tasksData.filter(task => task.event_id === id);
      
      console.log('Tasks for this event:', eventTasks);
      
      // Find tasks that need response (invitations)
      const invitations = eventTasks.filter(task => task.notification_status === 'sent');
      setPendingInvitations(invitations);
      
      // Transform tasks to the format expected by the TaskTable/TaskKanban components
      const formattedTasks = eventTasks.map(task => ({
        id: task.id,
        name: task.title,
        description: task.description,
        status: task.status === 'completed' ? 'Done' : 
                task.status === 'accepted' ? 'In Progress' : 
                task.notification_status === 'accept' ? 'In Progress' : 
                task.notification_status === 'sent' ? 'Todo' : 'Backlog',
        dueDate: task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'No deadline',
        eventId: task.event_id,
        assignee: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          initial: user.firstName.charAt(0)
        },
        task_assignment_id: task.id, // The task ID from getTasksForVolunteer is actually the task_assignment ID
        notification_status: task.notification_status
      }));
      
      setVolunteerTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  // Function to update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // Find the task_assignment_id
      const task = volunteerTasks.find(t => t.id === taskId);
      if (!task) return;
      
      // If task is being marked as Done, use handleComplete instead
      if (newStatus === 'Done') {
        return await handleComplete(taskId, task.task_assignment_id);
      }
      
      // Map frontend status to backend status
      let backendStatus;
      switch (newStatus) {
        case 'In Progress':
          backendStatus = 'accepted';
          break;
        case 'Todo':
          backendStatus = 'accepted'; // Still accepted, just not started
          break;
        case 'Backlog':
          backendStatus = 'pending';
          break;
        case 'In Review':
          backendStatus = 'accepted'; // No direct equivalent, treat as accepted
          break;
        default:
          backendStatus = 'pending';
      }
      
      // Update task status in the database
      const { error } = await supabase
        .from('task_assignment')
        .update({ status: backendStatus })
        .eq('id', task.task_assignment_id);
      
      if (error) {
        console.error('Error updating task status:', error);
        toast.error('Failed to update task status');
        return;
      }
      
      // Update local state
      const updatedTasks = volunteerTasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      setVolunteerTasks(updatedTasks);
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  // Handle accept task invitation
  const handleAccept = async (taskId) => {
    try {
      console.log(`Accepting task: task=${taskId}`);
      
      const { success, error } = await notificationService.handleTaskResponse(
        taskId,
        user.id,
        'accept'
      );
      
      if (success) {
        toast.success('Task accepted successfully');
        await fetchEventAndTasks(); // Refresh tasks
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task');
    }
  };

  // Handle reject task invitation
  const handleReject = async (taskId) => {
    try {
      console.log(`Rejecting task: task=${taskId}`);
      
      const { success, error } = await notificationService.handleTaskResponse(
        taskId,
        user.id,
        'reject'
      );
      
      if (success) {
        toast.success('Task rejected');
        await fetchEventAndTasks(); // Refresh tasks
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast.error('Failed to reject task');
    }
  };

  // Handle complete task
  const handleComplete = async (taskId, assignmentId) => {
    try {
      console.log(`Completing task: task=${taskId}, assignment=${assignmentId}`);
      
      if (!assignmentId) {
        console.error('Missing assignment ID for task completion');
        toast.error('Cannot complete task: missing assignment information');
        return;
      }
      
      // Update task assignment status
      const { error } = await supabase
        .from('task_assignment')
        .update({ status: 'completed' })
        .eq('id', assignmentId);
      
      if (error) {
        console.error('Error completing task:', error);
        toast.error('Failed to mark task as complete');
        return;
      }
      
      // Award points for task completion (10 points per task)
      try {
        const task = volunteerTasks.find(t => t.id === taskId);
        await pointsService.addPoints({
          volunteerId: user.id,
          points: 10,
          reason: `Completed task: ${task?.name || 'Task'}`,
          metadata: {
            taskId: taskId,
            assignmentId: assignmentId,
            eventId: event.id
          }
        });
        toast.success('Task marked as complete and points awarded!');
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't fail the entire operation if points couldn't be awarded
        toast.success('Task marked as complete, but there was an issue awarding points');
      }
      
      await fetchEventAndTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to mark task as complete');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col vol-dashboard">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8 pt-28 flex items-center justify-center">
            <LoadingSpinner size="large" text="Loading task details..." color="primary" />
          </main>
        </div>
      </div>
    );
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
                <span className="text-md font-medium dark:text-white high-contrast:text-white">
                  {event?.start_date ? format(new Date(event.start_date), 'MMMM d, yyyy') : 'No date'}
                </span>
                <span className="text-sm text-gray-600">
                  {event?.start_date && event?.end_date ? 
                    `${format(new Date(event.start_date), 'h:mm a')} - ${format(new Date(event.end_date), 'h:mm a')}` : 
                    'No time specified'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <Calendar size={16} />
                  Deadline
                </span>
                <span className="text-md font-medium dark:text-white high-contrast:text-white">
                  {event?.registration_deadline ? format(new Date(event.registration_deadline), 'MMMM d, yyyy') : 'No deadline'}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="text-md font-medium dark:text-white high-contrast:text-white">{event?.location || 'No location specified'}</span>
              </div>
              
              <div className="flex flex-col ml-16">
                <span className="text-gray-500 mb-1 flex items-center gap-2 dark:text-white high-contrast:text-white">
                  <Tag size={16} />
                  Event Type
                </span>
                <div className="mt-1">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 font-medium">
                    {event?.category || "Uncategorized"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Invitations Alert */}
          {pendingInvitations.length > 0 && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <Info className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800">You have {pendingInvitations.length} pending task invitation(s)</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-4">
                  {pendingInvitations.map(task => (
                    <div key={task.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <div className="text-sm mt-1">{task.description}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {task.deadline ? `Due: ${format(new Date(task.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAccept(task.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(task.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

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