import React, { useState, useEffect } from 'react';
import { useWebmasterAuth } from '@/lib/authContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  List,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventRegistrations, getAdminEventTasks } from '@/services/database.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import AccessibilityMenu from '@/components/AccessibilityMenu';
import { toast } from '@/components/ui/use-toast';

export const WebmasterEventDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useWebmasterAuth();

  // Event data for the specific ID
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventTasks, setEventTasks] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState(null);

  // Fetch event details and related data
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;

      try {
        // Get event details
        const { data: eventData, error: eventError } = await getEventById(id);
        if (eventError) throw eventError;

        if (eventData) {
          setEvent(eventData);

          // Use the getAdminEventTasks function to get tasks
          const { data: taskData, error: taskError } = await getAdminEventTasks(id);
          if (taskError) throw taskError;

          // Transform the tasks to the format expected by the UI
          const formattedTasks = taskData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status || 'Todo',
            priority: task.priority || 'Medium',
            due_date: task.deadline,
            event_id: task.event_id,
            assignees: task.assignments?.map(assignment => ({
              id: assignment.volunteer?.id,
              name: `${assignment.volunteer?.first_name || ''} ${assignment.volunteer?.last_name || ''}`.trim(),
              email: assignment.volunteer?.email,
              status: assignment.status,
              assignment_id: assignment.id
            })) || []
          }));

          setEventTasks(formattedTasks);

          // Get volunteer registrations
          const { data: registrationsData, error: registrationsError } = await getEventRegistrations(id);
          if (registrationsError) throw registrationsError;
          setRegistrations(registrationsData || []);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'Time not available';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Check if event has ended
  const isEventEnded = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  // Navigate back to events list
  const handleBack = () => {
    navigate('/webmaster/events');
  };

  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleBack}>
                Return to Events
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading event details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-10">
              <h3 className="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
              <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist or has been deleted.</p>
              <div className="mt-6">
                <Button onClick={handleBack}>
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
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <WebmasterSidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4">
            {/* Header with buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="mb-2 -ml-3 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Events
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold">{event?.title}</h1>
                <div className="flex flex-wrap items-center mt-2 gap-2">
                  <Badge variant={event?.status === 'scheduled' ? 'secondary' : 'outline'}>
                    {event?.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Read-only View
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatDate(event?.start_date)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                {isEventEnded(event?.end_date) && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/webmaster/events/${id}/feedback`)}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare size={18} />
                    View Feedback
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Event Info */}
                  <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                    
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{event?.title}</h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-auto">
                        {event?.category || 'Uncategorized'}
                      </Badge>
                    </div>

                    <div className="space-y-6">
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
                  <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-500">Registration Status</h3>
                      <Badge className="mt-2" variant={isEventEnded(event.end_date) ? 'destructive' : 'success'}>
                        {isEventEnded(event.end_date) ? 'Event Ended' : 'Registration Open'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Tasks ({eventTasks.length})</h2>
                  </div>

                  {eventTasks.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                      <List className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                      <p className="mt-1 text-sm text-gray-500">There are no tasks for this event.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Task
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned To
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eventTasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                <div className="text-sm text-gray-500">{task.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={
                                  task.status === 'Todo' ? 'outline' : 
                                  task.status === 'In Progress' ? 'secondary' :
                                  task.status === 'Review' ? 'warning' : 'success'
                                }>
                                  {task.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={
                                  task.priority === 'Low' ? 'outline' : 
                                  task.priority === 'Medium' ? 'secondary' : 'destructive'
                                }>
                                  {task.priority}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.due_date ? formatDate(task.due_date) : 'No deadline'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.assignees && task.assignees.length > 0 ? (
                                  <div className="space-y-1">
                                    {task.assignees.map((assignee, idx) => (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <Badge variant="outline" className="bg-gray-100">
                                          {assignee.name}
                                        </Badge>
                                        <Badge variant={
                                          assignee.status === 'pending' ? 'outline' : 
                                          assignee.status === 'accepted' ? 'secondary' :
                                          assignee.status === 'declined' ? 'destructive' : 'success'
                                        } className="text-xs">
                                          {assignee.status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Unassigned</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="volunteers" className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Registered Volunteers ({registrations.length})</h2>
                  </div>

                  {registrations.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                      <Users className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers</h3>
                      <p className="mt-1 text-sm text-gray-500">There are no volunteers registered for this event.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Volunteer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hours
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {registrations.map((registration) => (
                            <tr key={registration.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {registration.volunteer?.first_name} {registration.volunteer?.last_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {registration.volunteer?.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(registration.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {registration.hours || 'Not recorded'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={registration.status === 'confirmed' ? 'success' : 'secondary'}>
                                  {registration.status || 'Registered'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <AccessibilityMenu />
    </div>
  );
}; 