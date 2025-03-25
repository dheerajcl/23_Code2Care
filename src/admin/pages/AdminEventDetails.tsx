import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  List,
  Columns,
  Tag,
  User2,
  Edit,
  X,
  UserPlus,
  Trash2,
  Check,
  Mail,
  User,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getTasksByEventId, createTask, updateTask, deleteTask, getEventRegistrations, registerVolunteerForEvent, updateEventRegistration, deleteEventRegistration, getAdminEventTasks } from '@/services/database.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Task View Components
import TaskTable from '../components/AdminTaskTable';
import TaskKanban from '../components/AdminTaskKanban';
import AdminSidebar from '../components/AdminSidebar';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const AdminEventDetails = () => {
  const [activeView, setActiveView] = useState('table');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
  }, [user, navigate]);

  // If no user or not admin, show loading
  if (!user || user.role !== 'admin') {
    return null;
  }

  // Event data for the specific ID
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // Store all tasks
  const [allTasks, setAllTasks] = useState([]);
  // Store filtered tasks for the current event
  const [eventTasks, setEventTasks] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [taskView, setTaskView] = useState('table');
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    status: 'Todo',
    assignee_id: ''
  });

  // Volunteer registration form state
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');

  // Task counts state
  const [taskCounts, setTaskCounts] = useState({ todo: 0, inProgress: 0, inReview: 0, done: 0 });

  // Fetch event details and related data
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Get event details
        const { data: eventData, error: eventError } = await getEventById(id);
        if (eventError) throw eventError;

        if (eventData) {
          setEvent(eventData);

          // Use the updated getAdminEventTasks function
          const { data: taskData, error: taskError } = await getAdminEventTasks(id);
          if (taskError) throw taskError;

          console.log('Fetched tasks with assignments:', taskData);

          // Transform the tasks to the format expected by the UI components
          const formattedTasks = taskData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status || 'Todo',
            priority: task.priority || 'Medium',
            due_date: task.deadline,
            assignee_id: task.assignee_id,
            event_id: task.event_id,
            event_name: eventData.title || 'Event',
            assignees: task.assignments?.map(assignment => ({
              id: assignment.volunteer?.id,
              name: `${assignment.volunteer?.first_name || ''} ${assignment.volunteer?.last_name || ''}`.trim(),
              email: assignment.volunteer?.email,
              status: assignment.status,
              assignment_id: assignment.id,
              notification_status: assignment.notification_status
            })) || []
          }));

          console.log('Formatted tasks for UI:', formattedTasks);
          setAllTasks(formattedTasks);
          setEventTasks(formattedTasks);

          // Calculate task counts
          const counts = {
            todo: formattedTasks.filter(t => t.status === 'Todo').length,
            inProgress: formattedTasks.filter(t => t.status === 'In Progress').length,
            inReview: formattedTasks.filter(t => t.status === 'Review').length,
            done: formattedTasks.filter(t => t.status === 'Done').length
          };
          setTaskCounts(counts);

          // Get volunteer registrations
          const { data: registrationsData, error: registrationsError } = await getEventRegistrations(id);
          if (registrationsError) throw registrationsError;
          setRegistrations(registrationsData || []);

          // Fetch all volunteers
          const { data: volunteersData, error: volunteersError } = await supabase
            .from('volunteer')
            .select('*')
            .order('first_name', { ascending: true });
          if (volunteersError) throw volunteersError;
          setVolunteers(volunteersData || []);

          // Filter out volunteers already registered
          const registeredVolunteerIds = (registrationsData || []).map(reg => reg.volunteer_id);
          const availableVols = (volunteersData || []).filter(
            vol => !registeredVolunteerIds.includes(vol.id)
          );
          setAvailableVolunteers(availableVols);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // Function to refresh tasks
    const refreshTasks = async () => {
    if (!id) return;

    try {
      setLoading(true);
      // Use the updated getAdminEventTasks function
      const { data: taskData, error: taskError } = await getAdminEventTasks(id);
      if (taskError) throw taskError;

      // Transform tasks to format expected by UI
      const formattedTasks = taskData.map(task => {
        // Calculate the effective status based on assignments
        let effectiveStatus = task.status || 'Todo';
        
        // Get all assignment statuses
        const assignmentStatuses = task.assignments?.map(a => a.status) || [];
        
        // If all assignments are completed, mark task as Done
        if (assignmentStatuses.length > 0 && assignmentStatuses.every(s => s === 'completed')) {
          effectiveStatus = 'Done';
        } 
        // If any assignment is accepted/in progress, mark task as In Progress
        else if (assignmentStatuses.includes('accepted')) {
          effectiveStatus = 'In Progress';
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: effectiveStatus, // Use the calculated status
          originalStatus: task.status, // Keep the original for reference
          priority: task.priority || 'Medium',
          due_date: task.deadline,
          assignee_id: task.assignee_id,
          event_id: task.event_id,
          event_name: event?.title || 'Event',
          assignees: task.assignments?.map(assignment => ({
            id: assignment.volunteer?.id,
            name: `${assignment.volunteer?.first_name || ''} ${assignment.volunteer?.last_name || ''}`.trim(),
            email: assignment.volunteer?.email,
            status: assignment.status,
            assignment_id: assignment.id,
            notification_status: assignment.notification_status
          })) || []
        };
      });

      setAllTasks(formattedTasks);
      setEventTasks(formattedTasks);

      // Update task counts
      const counts = {
        todo: formattedTasks.filter(t => t.status === 'Todo').length,
        inProgress: formattedTasks.filter(t => t.status === 'In Progress').length,
        inReview: formattedTasks.filter(t => t.status === 'Review').length,
        done: formattedTasks.filter(t => t.status === 'Done').length
      };
      setTaskCounts(counts);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (err) {
      return "Date not specified";
    }
  };
  const handleCheckboxChange = (id: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectedVolunteers.length === volunteers.length) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(volunteers.map((v) => v.id));
    }
  };

  const sendMessage = async () => {
    if (selectedVolunteers.length === 0) {
      alert("Please select at least one volunteer.");
      return;
    }
  
    setIsSending(true);
    try {
      // Bulk insert notifications for selected volunteers
      const { error } = await supabase.from("internal_noti").insert(
        selectedVolunteers.map((volunteer_id) => ({
          volunteer_id,
          message: messageBody,
          title_noti: messageTitle,
          sent_at: new Date().toISOString()
        }))
      );
  
      if (error) {
        throw error;
      }
  
      setIsSent(true);
      setTimeout(() => setIsSent(false), 2000);
    } catch (error) {
      console.error("Error sending message", error);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };
  // Format time for display
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (err) {
      return "Time not specified";
    }
  };

  // Handle task form submission - updated to match schema
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const newTask = {
        title: taskForm.title,
        description: taskForm.description,
        deadline: taskForm.deadline,
        status: taskForm.status,
        event_id: id,
        assignee_id: taskForm.assignee_id || null,
        assignee_type: taskForm.assignee_id ? 'volunteer' : null
      };

      const { data, error } = await supabase
        .from('task')
        .insert(newTask)
        .select();

      if (error) throw error;

      // Add the new task to state
      if (data) {
        const newTaskWithProgress = {
          ...data[0],
          progress: 0,
          totalAssigned: 0,
          totalDone: 0,
          assignments: []
        };

        setAllTasks([...allTasks, newTaskWithProgress]);
        setEventTasks([...eventTasks, newTaskWithProgress]);

        // Reset form
        setTaskForm({
          title: '',
          description: '',
          deadline: '',
          priority: 'Medium',
          status: 'Todo',
          assignee_id: ''
        });

        setShowTaskForm(false);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
    }
  };

  // Handle task status update
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const task = allTasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // First update the main task status
      const { error } = await supabase
        .from('task')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Now, if task has assignments, update their statuses too
      if (task.assignees && task.assignees.length > 0) {
        // Map admin UI status to database status values
        let assignmentStatus;
        switch (newStatus) {
          case 'Done':
            assignmentStatus = 'completed';
            break;
          case 'In Progress':
            assignmentStatus = 'accepted';
            break;
          case 'Todo':
            assignmentStatus = 'pending';
            break;
          case 'Review':
          default:
            assignmentStatus = 'accepted'; // Map In Review to accepted in DB
        }
        
        // Update all assignments for this task
        for (const assignee of task.assignees) {
          const { error: assignmentError } = await supabase
            .from('task_assignment')
            .update({ status: assignmentStatus })
            .eq('id', assignee.assignment_id);
            
          if (assignmentError) {
            console.error('Error updating assignment status:', assignmentError);
          }
        }
      }

      // Update tasks state
        setAllTasks(allTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));

        setEventTasks(eventTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      
      toast.success(`Task status updated to ${newStatus}`);
      
      // Refresh tasks to ensure we have the latest data
      await refreshTasks();
      
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.message);
      toast.error('Failed to update task status');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      // First delete all task assignments
      const { error: assignmentError } = await supabase
        .from('task_assignment')
        .delete()
        .eq('task_id', taskId);

      if (assignmentError) throw assignmentError;

      // Then delete the task
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Remove task from state
      setAllTasks(allTasks.filter(task => task.id !== taskId));
      setEventTasks(eventTasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
    }
  };

  // Handle volunteer registration
  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();

    if (!selectedVolunteer) {
      setError('Please select a volunteer to register');
      return;
    }

    try {
      const { data, error } = await registerVolunteerForEvent(id, selectedVolunteer);
      if (error) throw error;

      // Update registrations state
      if (data) {
        // Fetch the volunteer details
        const { data: volunteerData } = await supabase
          .from('volunteer')
          .select('*')
          .eq('id', selectedVolunteer)
          .single();

        const newRegistration = {
          ...data,
          volunteer: volunteerData
        };

        setRegistrations([...registrations, newRegistration]);

        // Update available volunteers
        setAvailableVolunteers(availableVolunteers.filter(vol => vol.id !== selectedVolunteer));

        // Reset form
        setSelectedVolunteer('');
        setShowRegistrationForm(false);
      }
    } catch (err) {
      console.error('Error registering volunteer:', err);
      setError(err.message);
    }
  };

  // Handle volunteer hours update
  const handleUpdateHours = async (registrationId, hours) => {
    try {
      const { data, error } = await updateEventRegistration(registrationId, {
        hours: parseFloat(hours)
      });

      if (error) throw error;

      // Update registrations state
      if (data) {
        setRegistrations(registrations.map(reg =>
          reg.id === registrationId ? { ...reg, hours: parseFloat(hours) } : reg
        ));
      }
    } catch (err) {
      console.error('Error updating hours:', err);
      setError(err.message);
    }
  };

  // Handle removing volunteer registration
  const handleRemoveVolunteer = async (registrationId, volunteerId) => {
    try {
      const { error } = await deleteEventRegistration(registrationId);
      if (error) throw error;

      // Remove registration from state
      setRegistrations(registrations.filter(reg => reg.id !== registrationId));

      // Add volunteer back to available volunteers
      const volunteer = volunteers.find(vol => vol.id === volunteerId);
      if (volunteer) {
        setAvailableVolunteers([...availableVolunteers, volunteer]);
      }
    } catch (err) {
      console.error('Error removing volunteer:', err);
      setError(err.message);
    }
  };

  // Handle edit event
  const handleEditEvent = () => {
    navigate(`/admin/events/${id}/edit`);
  };

  const handleDone = () => {
    navigate('/admin/events');
  };

  // Calculate task statistics based on status
  const taskStats = {
    todo: eventTasks.filter(task => task.status === 'Todo').length,
    inProgress: eventTasks.filter(task => task.status === 'In Progress').length,
    review: eventTasks.filter(task => task.status === 'Review').length,
    done: eventTasks.filter(task => task.status === 'Done').length
  };

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };

  // Add a new task to the current event - will navigate to task create page
  const handleAddTask = () => {
    navigate(`/admin/events/${id}/createtask`);
  };

  // Check if event has ended
  const isEventEnded = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleDone} className="bg-purple-600 hover:bg-purple-700">
                Return to Events
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-10">
              <h3 className="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
              <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist or has been deleted.</p>
              <div className="mt-6">
                <Button onClick={handleDone}>
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
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {/* Header with buttons */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">{event?.title || 'Loading...'}</h1>
                <div className="flex items-center mt-2">
                  <Badge variant={event?.status === 'scheduled' ? 'secondary' : 'outline'}>
                    {event?.status}
                  </Badge>
                  <span className="ml-2 text-muted-foreground">
                    {formatDate(event?.start_date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEventEnded(event?.end_date) && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/admin/events/${id}/feedback`)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare size={20} />
                    View Feedback
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleEditEvent}
                  className="flex items-center gap-2"
                >
                  <Edit size={20} />
                  Edit Event
                </Button>
                <Button onClick={handleDone}>Done</Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 flex">
                <TabsTrigger value="details" className="flex-1">Event Details</TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
                <TabsTrigger value="volunteers" className="flex-1">Volunteers</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Info */}
                  <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">{event?.name || 'Event Name'}</h2>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200 ml-auto">
                        {event?.category || 'Uncategorized'}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                        <p className="mt-1">{event.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {formatTime(event.start_date)} - {formatTime(event.end_date)}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Location</h3>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {event.location}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Volunteer Capacity</h3>
                        <div className="flex items-center mt-1">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {registrations.length} / {event.max_volunteers || 'Unlimited'} volunteers registered
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Image */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 md:h-full overflow-hidden">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Tasks Overview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('tasks')}
                    >
                      View All Tasks
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Todo</h3>
                      <p className="text-2xl font-bold">{taskStats.todo}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">In Progress</h3>
                      <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Review</h3>
                      <p className="text-2xl font-bold">{taskStats.review}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Done</h3>
                      <p className="text-2xl font-bold">{taskStats.done}</p>
                    </div>
                  </div>
                </div>

                {/* Volunteer Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Volunteers Overview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('volunteers')}
                    >
                      Manage Volunteers
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Registered</h3>
                      <p className="text-2xl font-bold">{registrations.length}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Total Hours</h3>
                      <p className="text-2xl font-bold">
                        {registrations.reduce((sum, reg) => sum + parseFloat(reg.hours_served || 0), 0).toFixed(1)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Spots Remaining</h3>
                      <p className="text-2xl font-bold">
                        {event.max_volunteers ? Math.max(0, event.max_volunteers - registrations.length) : 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Event Tasks</h2>
                      <p className="text-gray-500">Manage tasks for this event</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={taskView === 'table' ? 'default' : 'outline'}
                        onClick={() => setTaskView('table')}
                        className={taskView === 'table' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        <List className="mr-2 h-4 w-4" />
                        Table
                      </Button>
                      <Button
                        variant={taskView === 'kanban' ? 'default' : 'outline'}
                        onClick={() => setTaskView('kanban')}
                        className={taskView === 'kanban' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        <Columns className="mr-2 h-4 w-4" />
                        Kanban
                      </Button>
                      <Button
                        onClick={() => navigate(`/admin/events/${id}/createtask`)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>

                  {eventTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks created yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new task for this event.</p>
                      <div className="mt-6">
                        <Button onClick={() => navigate(`/admin/events/${id}/createtask`)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Task
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {taskView === 'table' ? (
                        <TaskTable
                          tasks={eventTasks}
                          onStatusChange={handleTaskStatusChange}
                          onDelete={handleDeleteTask}
                        />
                      ) : (
                        <TaskKanban
                          tasks={eventTasks}
                          onStatusChange={handleTaskStatusChange}
                          onDelete={handleDeleteTask}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Add Task Form Modal */}
                {showTaskForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Add New Task</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <form onSubmit={handleCreateTask}>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">
                              Title
                            </label>
                            <Input
                              id="task-title"
                              value={taskForm.title}
                              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                              className="mt-1"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <Textarea
                              id="task-description"
                              value={taskForm.description}
                              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700">
                              Due Date
                            </label>
                            <Input
                              id="task-due-date"
                              type="datetime-local"
                              value={taskForm.deadline}
                              onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700">
                              Priority
                            </label>
                            <Select
                              value={taskForm.priority}
                              onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                            >
                              <SelectTrigger id="task-priority" className="mt-1">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label htmlFor="task-status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <Select
                              value={taskForm.status}
                              onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}
                            >
                              <SelectTrigger id="task-status" className="mt-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Todo">To Do</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Review">Review</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700">
                              Assignee
                            </label>
                            <Select
                              value={taskForm.assignee_id}
                              onValueChange={(value) => setTaskForm({ ...taskForm, assignee_id: value })}
                            >
                              <SelectTrigger id="task-assignee" className="mt-1">
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {user && (
                                  <SelectItem value={user.id}>
                                    Me ({user.firstName} {user.lastName})
                                  </SelectItem>
                                )}
                                {volunteers.map(volunteer => (
                                  <SelectItem key={volunteer.id} value={volunteer.id}>
                                    {volunteer.first_name} {volunteer.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                            Create Task
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="volunteers" className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Event Volunteers</h2>
                      <p className="text-gray-500">
                        {registrations.length} / {event.max_volunteers || 'Unlimited'} volunteers registered
                      </p>
                    </div>

                    <div className="flex items-center gap-4 py-2">
            <Checkbox checked={selectedVolunteers.length === volunteers.length} onCheckedChange={handleSelectAll} />
            <span>Select All</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h3 className="text-lg font-semibold mb-2">Send Notification</h3>
              <Input
                placeholder="Enter Title"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="mb-2"
                disabled={isSending}
              />
              <Textarea
                placeholder="Enter Message"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="mb-2"
                disabled={isSending}
              />
              <Button onClick={sendMessage} className="w-full" disabled={isSending && isSent}>
                {isSent ? <CheckCircle className="w-5 h-5 mr-2" /> : null}
                {isSent ? 'Sent!' : isSending ? 'Sending...' : 'Send'}
              </Button>
            </PopoverContent>
          </Popover>
                  </div>


                  {registrations.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers registered yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add volunteers to this event using the Register Volunteer button.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Select
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Volunteer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hours Served
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {registrations.map((registration) => (
                            <tr key={registration.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                    <Checkbox
                checked={selectedVolunteers.includes(registration.volunteer.id)}
                onCheckedChange={() => handleCheckboxChange(registration.volunteer.id)}
              />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {registration.volunteer.first_name} {registration.volunteer.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {registration.volunteer.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(registration.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={`
                                  ${registration.status === 'successful' ? 'bg-green-100 text-green-800' : ''}
                                  ${registration.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                                  ${registration.status === 'Waitlisted' ? 'bg-yellow-100 text-yellow-800' : ''}
                                `}>
                                  {registration.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    className="w-20"
                                    value={registration.hours || 0}
                                    onChange={(e) => handleUpdateHours(registration.id, e.target.value)}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateHours(registration.id, registration.hours || 0)}
                                    className="h-8 w-8 p-0"
                                  >
                                  </Button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveVolunteer(registration.id, registration.volunteer.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Register Volunteer Form Modal */}
                {showRegistrationForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Register Volunteer</h2>
                        <Button variant="ghost" size="sm" onClick={() => setShowRegistrationForm(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {availableVolunteers.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-gray-500">All volunteers are already registered for this event.</p>
                          <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => setShowRegistrationForm(false)}
                          >
                            Close
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleRegisterVolunteer}>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="volunteer" className="block text-sm font-medium text-gray-700">
                                Select Volunteer
                              </label>
                              <Select
                                value={selectedVolunteer}
                                onValueChange={setSelectedVolunteer}
                              >
                                <SelectTrigger id="volunteer" className="mt-1">
                                  <SelectValue placeholder="Select a volunteer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableVolunteers.map(volunteer => (
                                    <SelectItem key={volunteer.id} value={volunteer.id}>
                                      {volunteer.first_name} {volunteer.last_name} ({volunteer.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="mt-6 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowRegistrationForm(false)}>
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-purple-600 hover:bg-purple-700"
                              disabled={!selectedVolunteer}
                            >
                              Register
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <AccessibilityMenu/>
    </div>
  );
};

export default AdminEventDetails;