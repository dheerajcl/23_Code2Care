import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
<<<<<<< HEAD
import { Calendar, Clock, MapPin, Users, Plus, List, Columns, Tag, User2, MessageSquare } from 'lucide-react';
=======
import { Calendar, Clock, MapPin, Users, Plus, List, Columns, Tag, User2, Edit, X, UserPlus, Trash2, Check, Mail, User } from 'lucide-react';
>>>>>>> 695cb9e (Fixed Feedback Heading Alighnment. Resolves #1)
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getTasksByEventId, createTask, updateTask, deleteTask, getEventRegistrations, registerVolunteerForEvent, updateEventRegistration, deleteEventRegistration } from '@/services/database.service';
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

// Task View Components
import TaskTable from '../components/AdminTaskTable';
import TaskKanban from '../components/AdminTaskKanban';
import AdminSidebar from '../components/AdminSidebar';

const AdminEventDetails = () => {
  const [activeView, setActiveView] = useState('table');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useAuth();
<<<<<<< HEAD
=======

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
>>>>>>> 695cb9e (Fixed Feedback Heading Alighnment. Resolves #1)

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
          
          // Get tasks for this event - Updated to fetch from task table
          const { data: tasksData, error: tasksError } = await supabase
            .from('task')
            .select(`
              id,
              title,
              description,
              status,
              start_time,
              end_time,
              skills,
              max_volunteers,
              created_at,
              updated_at,
              event_id,
              assignee_type,
              assignee_id,
              deadline
            `)
            .eq('event_id', id);
          
          if (tasksError) throw tasksError;
          
          // For each task, fetch task assignments to calculate progress
          const tasksWithProgress = await Promise.all(tasksData.map(async (task) => {
            // Get task assignments for this task
            const { data: assignments, error: assignmentsError } = await supabase
              .from('task_assignment')
              .select('*')
              .eq('task_id', task.id);
            
            if (assignmentsError) throw assignmentsError;
            
            // Calculate progress as done/assigned
            const totalAssigned = assignments ? assignments.length : 0;
            const totalDone = assignments ? assignments.filter(a => a.done > 0).length : 0;
            
            // Calculate progress percentage
            const progress = totalAssigned > 0 ? (totalDone / totalAssigned) * 100 : 0;
            
            return {
              ...task,
              progress,
              totalAssigned,
              totalDone,
              assignments: assignments || [],
              tasksData
            };
          }));
          
          setAllTasks(tasksWithProgress || []);
          setEventTasks(tasksWithProgress || []);
          
          // Get volunteer registrations for this event
          const { data: registrationsData, error: registrationsError } = await getEventRegistrations(id);
          if (registrationsError) throw registrationsError;
          setRegistrations(registrationsData || []);
          
          // Get all volunteers 
          const { data: allVolunteers, error: volunteersError } = await supabase
            .from('volunteer')
            .select('*')
            .order('first_name', { ascending: true });
          
          if (volunteersError) throw volunteersError;
          
          // Filter out volunteers already registered
          const registeredIds = registrationsData ? registrationsData.map(reg => reg.volunteer.id) : [];
          const available = allVolunteers.filter(vol => !registeredIds.includes(vol.id));
          
          setVolunteers(allVolunteers || []);
          setAvailableVolunteers(available || []);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (err) {
      return "Date not specified";
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
      const { data, error } = await supabase
        .from('task')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select();
        
      if (error) throw error;
      
      // Update tasks state
      if (data) {
        const updatedTask = data[0];
        
        setAllTasks(allTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
        
        setEventTasks(eventTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.message);
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
            
<<<<<<< HEAD
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              </TabsList>
=======
            <div className="flex gap-2">
              <Button onClick={handleEditEvent} className="bg-purple-600 hover:bg-purple-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
              {(event.status === 'Completed' || new Date(event.start_date) < new Date()) && (
                <Button 
                  onClick={() => navigate(`/admin/events/${id}/feedback`)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <User2 className="mr-2 h-4 w-4" />
                  View Feedback
                </Button>
              )}
              <Button onClick={handleDone} className="bg-green-600 hover:bg-green-700">
                Done
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Event Info */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1">{event.description}</p>
                    </div>
>>>>>>> 695cb9e (Fixed Feedback Heading Alighnment. Resolves #1)
              
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Info */}
                  <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                    
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
                            {formatDate(event.start_date)}
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
                            onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
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
                            onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
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
                            onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700">
                            Priority
                          </label>
                          <Select
                            value={taskForm.priority}
                            onValueChange={(value) => setTaskForm({...taskForm, priority: value})}
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
                            onValueChange={(value) => setTaskForm({...taskForm, status: value})}
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
                            onValueChange={(value) => setTaskForm({...taskForm, assignee_id: value})}
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
                  
                  <Button 
                    onClick={() => setShowRegistrationForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={event.max_volunteers && registrations.length >= event.max_volunteers}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Volunteer
                  </Button>
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
                                ${registration.status === 'Registered' ? 'bg-green-100 text-green-800' : ''}
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
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
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
    </div>
  );
};

export default AdminEventDetails;