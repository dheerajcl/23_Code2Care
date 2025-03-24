import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FilterIcon, CheckIcon, PlusIcon, XIcon, UserPlusIcon, Trash2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createTaskAssignment, Task } from '@/services/database.service';
import { emailService } from '@/services/email.service';
import { notificationService } from '@/services/notification.service';

const CreateTask = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { id: eventId } = useParams(); // Extract event ID from URL params
  
  // Event state
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  // Task State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState<number>(1);
  const [status, setStatus] = useState('todo');
  const [deadline, setDeadline] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  
  // Reference Data
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  
  // Volunteer Filter State
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [interestFilter, setInterestFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
    { value: 'backlog', label: 'Backlog' }
  ];

  // Availability options
  const availabilityOptions = [
    { value: 'weekends', label: 'Weekends' },
    { value: 'Weekends', label: 'Weekends' },
    { value: 'both', label: 'Both' }
  ];

  // Skill options
  const skillOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Writing', label: 'Writing' },
    { value: 'Design', label: 'Design' },
    { value: 'Event Management', label: 'Event Management' },
    { value: 'Teaching', label: 'Teaching' },
    { value: 'Administration', label: 'Administration' },
    { value: 'Testing', label: 'Testing' },
    { value: 'Software', label: 'Software' }
  ];

  // Interest options
  const interestOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Education', label: 'Education' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Helping', label: 'Helping' }
  ];
// For modal management
const [selectedVolunteer, setSelectedVolunteer] = useState(null);

// Function to view volunteer details
const handleViewVolunteer = (volunteer) => {
  setSelectedVolunteer(volunteer);
};

// Function to close modal
const closeModal = () => {
  setSelectedVolunteer(null);
};

const handleLogout = async () => {
  await auth.logout();
  navigate('/admin/login');
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
  // Fetch event details and registered volunteers
  useEffect(() => {
    const fetchEventAndVolunteers = async () => {
      setEventLoading(true);
      setVolunteersLoading(true);
      
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (eventError) throw eventError;
        setEvent(eventData);
        
        // Fetch volunteers registered for this event from event_signup table
        const { data: signupData, error: signupError } = await supabase
          .from('event_signup')
          .select(`
            id,
            event_id,
            volunteer_id,
            created_at,
            status,
            hours,
            volunteer:volunteer_id (*)
          `)
          .eq('event_id', eventId);
  
        if (signupError) {
          console.error('Error fetching event signups:', signupError);
          toast.error('Failed to load registered volunteers');
          setAllVolunteers([]);
          setFilteredVolunteers([]);
          setEventLoading(false);
          setVolunteersLoading(false);
          return;
        }

        console.log('Sign up data check:', signupData);

        if (signupData && signupData.length > 0) {
          const volunteerIds = signupData.map(signup => signup.volunteer_id);
          
          // Fetch volunteer details
          const { data: volunteersData, error: volunteersError } = await supabase
            .from('volunteer')
            .select('*')
            .in('id', volunteerIds);
            
          if (volunteersError) throw volunteersError;
          
          // Process volunteer data to match the required format
          const formattedVolunteers = volunteersData.map(vol => ({
            id: vol.id,
            name: `${vol.first_name || ''} ${vol.last_name || ''}`.trim(),
            email: vol.email,
            availability: vol.availability || 'weekends',
            skills: vol.skills || [],
            location: vol.city || 'Not specified',
            state: vol.state || 'Karnataka',
            isRecommended: eventData.category && vol.skills && vol.skills.includes(eventData.category)
          }));
          
          setAllVolunteers(formattedVolunteers);
          setFilteredVolunteers(formattedVolunteers);
        } else {
          toast.info('No volunteers are registered for this event');
          setAllVolunteers([]);
          setFilteredVolunteers([]);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to load event data');
      } finally {
        setEventLoading(false);
        setVolunteersLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventAndVolunteers();
    }
  }, [eventId]);

  // Apply filters to volunteers
  useEffect(() => {
    // Apply filters to volunteers
    let filtered = [...allVolunteers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(volunteer => 
        volunteer.name?.toLowerCase().includes(query) || 
        volunteer.email?.toLowerCase().includes(query) ||
        volunteer.location?.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(volunteer => 
        volunteer.availability === availabilityFilter
      );
    }

    // Apply skills filter
    if (skillsFilter.length > 0) {
      filtered = filtered.filter(volunteer => 
        volunteer.skills?.some(skill => skillsFilter.includes(skill))
      );
    }

    // Apply interest filter
    if (interestFilter.length > 0) {
      filtered = filtered.filter(volunteer => 
        volunteer.skills?.some(skill => interestFilter.includes(skill))
      );
    }

    setFilteredVolunteers(filtered);
  }, [allVolunteers, searchQuery, availabilityFilter, skillsFilter, interestFilter]);

  // Toggle individual volunteer selection
  const toggleVolunteer = (volunteerId) => {
    setSelectedVolunteers(prev => {
      // If volunteer is already selected, remove them
      if (prev.includes(volunteerId)) {
        return prev.filter(id => id !== volunteerId);
      } 
      // If we've reached max volunteers, don't add more
      else if (prev.length >= maxVolunteers) {
        toast.error(`Maximum of ${maxVolunteers} volunteer(s) allowed`);
        return prev;
      }
      // Otherwise add the volunteer
      else {
        return [...prev, volunteerId];
      }
    });
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all selected, deselect all
      setSelectedVolunteers([]);
    } else {
      // If not all selected, select up to max volunteers
      const toSelect = filteredVolunteers.slice(0, maxVolunteers).map(v => v.id);
      setSelectedVolunteers(toSelect);
      
      if (filteredVolunteers.length > maxVolunteers) {
        toast.info(`Selected first ${maxVolunteers} volunteers (maximum allowed)`);
      }
    }
    setSelectAll(!selectAll);
  };

  // Reset select all when filtered volunteers change
  useEffect(() => {
    const allSelected = filteredVolunteers.length > 0 && 
                        filteredVolunteers.slice(0, maxVolunteers).every(v => selectedVolunteers.includes(v.id));
    setSelectAll(allSelected);
  }, [filteredVolunteers, selectedVolunteers, maxVolunteers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    if (!eventId) {
      toast.error('Please select an event');
      return;
    }

    const maxVolunteersNum = Number(maxVolunteers);
    if (isNaN(maxVolunteersNum) || maxVolunteersNum <= 0) {
      toast.error('Please enter a valid number of maximum volunteers');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      
      // 1. Create the task
      const taskInput = {
        title,
        description,
        start_time: now,
        end_time: deadline ? format(deadline, 'yyyy-MM-dd HH:mm:ss') : null,
        max_volunteers: maxVolunteersNum as number,
        status,
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
        created_at: now,
        updated_at: now,
        event_id: eventId
      };

      const { data: taskData, error: taskError } = await supabase
        .from('task')
        .insert(taskInput)
        .select('id')
        .single();
        
      if (taskError) {
        throw taskError;
      }
      
      const taskId = taskData.id;
      console.log('Created task with ID:', taskId);
      
      // 2. Assign volunteers
      if (selectedVolunteers.length > 0) {
        const assignmentToast = toast.loading(
          `Assigning ${selectedVolunteers.length} volunteers to task...`
        );

        let successCount = 0;
        let errorCount = 0;

        // Process assignments sequentially to avoid race conditions
        for (const volunteerId of selectedVolunteers) {
          try {
            // Instead of using createTaskAssignment, insert directly
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Check if volunteer is registered for the event first
            const { data: registration } = await supabase
              .from('event_signup')
              .select('id')
              .eq('event_id', eventId)
              .eq('volunteer_id', volunteerId)
              .single();
              
            if (!registration) {
              console.error(`Volunteer ${volunteerId} is not registered for event ${eventId}`);
              errorCount++;
              continue;
            }
            
            // Get volunteer details for email and notification
            const { data: volunteerData, error: volunteerError } = await supabase
              .from('volunteer')
              .select('*')
              .eq('id', volunteerId)
              .single();
              
            if (volunteerError || !volunteerData) {
              console.error(`Error fetching volunteer ${volunteerId} details:`, volunteerError);
              errorCount++;
              continue;
            }

            // First check if the volunteer email exists and is valid
            if (!volunteerData.email || !volunteerData.email.includes('@')) {
              console.error(`Invalid or missing email for volunteer ${volunteerId}`);
              errorCount++;
              continue;
            }

            // Create the task assignment directly
            const { data: assignmentData, error: assignError } = await supabase
              .from('task_assignment')
              .insert({
                task_id: taskId,
                volunteer_id: volunteerId,
                event_id: eventId,
                created_at: now,
                notification_status: 'pending',
                status: 'pending',
                response_deadline: tomorrow.toISOString(),
                todo: 1,
                assigned: 1,
                notification_sent_at: now
              })
              .select()
              .single();

            if (assignError) {
              console.error(`Error assigning volunteer ${volunteerId}:`, assignError);
              errorCount++;
            } else {
              // Create notification for the volunteer and link it to the task assignment
              const { error: notifError } = await supabase
                .from('notification')
                .insert({
                  recipient_id: volunteerId,
                  task_assignment_id: assignmentData.id,
                  title: `New Task Assignment: ${title}`,
                  message: `You have been assigned to task "${title}" for event "${event.title}"`,
                  type: 'task_assignment',
                  is_read: false,
                  created_at: now
                });
                
              if (notifError) {
                console.error(`Notification creation failed: ${notifError.message}`);
                // Rollback task assignment if notification fails
                await supabase
                  .from('task_assignment')
                  .delete()
                  .eq('id', assignmentData.id);
                throw notifError;
              }
              
              // Add email notification using the dedicated notification service
              try {
                // Use the notification service to handle all aspects of the notification
                // including email, in-app notification, and status tracking
                const { success, error } = await notificationService.notifyTaskAssignment(
                  assignmentData.id,
                  volunteerId,
                  taskId,
                  eventId
                );
                
                if (!success) {
                  console.error(`Failed to send notification to volunteer ${volunteerId}:`, error);
                  
                  // Email debug helper - run only if there's an error with sending
                  console.log("🔍 DEBUGGING EMAIL ISSUE:");
                  console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
                  console.log("Template ID:", import.meta.env.VITE_EMAILJS_TASK_TEMPLATE_ID);
                  
                  // Check volunteer data
                  const { data: volunteerCheck } = await supabase
                    .from('volunteer')
                    .select('email, first_name, last_name')
                    .eq('id', volunteerId)
                    .single();
                    
                  if (volunteerCheck) {
                    console.log("Volunteer email check:", {
                      email: volunteerCheck.email,
                      name: `${volunteerCheck.first_name} ${volunteerCheck.last_name}`
                    });
                  }
                  
                  // Try debugging the template
                  await emailService.debugTemplate(import.meta.env.VITE_EMAILJS_TASK_TEMPLATE_ID);
                  
                  toast.error(`Volunteer assigned but notification failed: ${error.message || 'Unknown error'}`);
                } else {
                  console.log(`Notification sent successfully to volunteer ${volunteerId}`);
                }
                
                // Increment success count ONLY after all operations succeed
                successCount++;
                
                // Refresh dashboard data
                window.dispatchEvent(new CustomEvent('task-assignment-update'));
              } catch (notifyError) {
                console.error(`Error in notification service for volunteer ${volunteerId}:`, notifyError);
                // Don't fail the entire process due to notification error
                // The volunteer is still assigned, but may not get a notification
                toast.warning(`Volunteer assigned but may not receive notification`);
                successCount++;
              }
            }
          } catch (err) {
            console.error(`Error in assignment process for ${volunteerId}:`, err);
            errorCount++;
          }
        }

        toast.dismiss(assignmentToast);

        if (successCount > 0) {
          toast.success(`Successfully assigned ${successCount} volunteers to the task`);
        }
        if (errorCount > 0) {
          toast.error(`Failed to assign ${errorCount} volunteers. Check console for details.`);
        }
      }

      // 3. Navigate back to event details
      navigate(`/admin/events/${eventId}`);
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter toggle buttons
  const SkillToggle = ({ skill }) => {
    const isSelected = skillsFilter.includes(skill);
    
    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => {
          if (isSelected) {
            setSkillsFilter(skillsFilter.filter(s => s !== skill));
          } else {
            setSkillsFilter([...skillsFilter, skill]);
          }
        }}
      >
        {skill}
      </Button>
    );
  };

  const InterestToggle = ({ interest }) => {
    const isSelected = interestFilter.includes(interest);
    
    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => {
          if (isSelected) {
            setInterestFilter(interestFilter.filter(i => i !== interest));
          } else {
            setInterestFilter([...interestFilter, interest]);
          }
        }}
      >
        {interest}
      </Button>
    );
  };

  const AvailabilityToggle = ({ availability }) => {
    const isSelected = availabilityFilter === availability;
    
    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => {
          if (isSelected) {
            setAvailabilityFilter('');
          } else {
            setAvailabilityFilter(availability);
          }
        }}
      >
        {availability}
      </Button>
    );
  };

  const handleAssignVolunteer = async (volunteerId: string) => {
    try {
      console.log(`Assigning volunteer ${volunteerId} to task ${taskId}`);
      if (!taskId) {
        console.error('Task ID is undefined');
        toast.error('Cannot assign volunteer: Task ID is missing');
        return;
      }

      // First check if the task assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from('task_assignment')
        .select('*')
        .eq('task_id', taskId)
        .eq('volunteer_id', volunteerId)
        .maybeSingle();

      if (existingAssignment) {
        toast.info('This volunteer is already assigned to this task');
        return;
      }

      const now = new Date().toISOString();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Directly create the assignment without using the function that might have triggers
      const { error: assignError } = await supabase
        .from('task_assignment')
        .insert({
          task_id: taskId,
          volunteer_id: volunteerId,
          event_id: eventId,
          created_at: now,
          notification_status: 'pending',
          status: 'pending',
          response_deadline: tomorrow.toISOString(),
          todo: 1,
          assigned: 1
        });

      if (assignError) {
        console.error('Error assigning volunteer', volunteerId, ':', assignError.message);
        toast.error(`Failed to assign volunteer: ${assignError.message}`);
        return;
      }

      // Create a notification for the volunteer
      await supabase
        .from('notification')
        .insert({
          recipient_id: volunteerId,
          title: `New Task Assignment: ${title}`,
          message: `You have been assigned to task "${title}" for event "${event.title}"`,
          type: 'task_assignment',
          is_read: false,
          created_at: now
        });

      toast.success('Volunteer assigned successfully');
      setAssignedVolunteers([...assignedVolunteers, volunteerId]);
    } catch (error) {
      console.error('Error assigning volunteer', volunteerId, ':', error);
      toast.error('Failed to assign volunteer');
    }
  };

return (
      <AdminLayout
          user={auth.user}
          handleLogout={handleLogout}
          title={`Create Task for Event: ${eventLoading ? 'Loading...' : event?.title || 'Unknown Event'}`}
          className="sticky"
        >
        <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {eventLoading ? (
            <div className="text-center py-8">Loading event details...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Task Details Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>
                    Enter the basic information for this task
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the task in detail"
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                      <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the task in detail"
                        rows={5}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxVolunteers">Maximum Volunteers</Label>
                        <Input 
                          id="maxVolunteers" 
                          type="number" 
                          min="1"
                          value={String(maxVolunteers)}
                          onChange={(e) => {
                            const newMax = Math.max(1, parseInt(e.target.value) || 1);
                            setMaxVolunteers(newMax);
                            // If we have more selected volunteers than the new max, trim the selection
                            if (selectedVolunteers.length > newMax) {
                              setSelectedVolunteers(prev => prev.slice(0, newMax));
                              toast.info(`Adjusted selected volunteers to match new maximum (${newMax})`);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              id="deadline"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {deadline ? format(deadline, 'PPP') : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={deadline}
                              onSelect={setDeadline}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Volunteer Assignment Card - Updated to match the image */}
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle>Assign Event Volunteers</CardTitle>
                    <CardDescription>
                      {selectedVolunteers.length} of {maxVolunteers} volunteers selected from registered event participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {volunteersLoading ? (
                      <div className="text-center py-4">Loading volunteers...</div>
                    ) : (
                      <>
                        {/* Search and Filters Section */}
                        <div className="mb-4">
                          <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              placeholder="Search volunteers by name, email, or location..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 pr-10 w-full"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                              >
                                <FilterIcon className="h-4 w-4 mr-1" />
                                Filters
                                <span className={`ml-1 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}>
                                  ▾
                                </span>
                              </Button>
                            </div>
                          </div>
                          
                          {isFiltersOpen && (
                            <div className="space-y-4 mb-6">
                              {/* Skills Section */}
                              <div>
                                <h3 className="text-sm font-medium mb-2">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                  {skillOptions.map((skill) => (
                                    <SkillToggle key={skill.value} skill={skill.value} />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Primary Interest Section */}
                              <div>
                                <h3 className="text-sm font-medium mb-2">Primary Interest</h3>
                                <div className="flex flex-wrap gap-2">
                                  {interestOptions.map((interest) => (
                                    <InterestToggle key={interest.value} interest={interest.value} />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Availability Section */}
                              <div>
                                <h3 className="text-sm font-medium mb-2">Availability</h3>
                                <div className="flex flex-wrap gap-2">
                                  {availabilityOptions.map((option) => (
                                    <AvailabilityToggle key={option.value} availability={option.value} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Select All Button */}
                        <div className="flex justify-between items-center mb-4">
                          <Button
                            variant={selectAll ? "default" : "outline"}
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={filteredVolunteers.length === 0}
                            type="button"
                          >
                            {selectAll ? 'Deselect All' : 'Select All'}
                          </Button>
                          <span className="text-sm text-gray-500">
                            {filteredVolunteers.length} volunteers found from {allVolunteers.length} registered for this event
                          </span>
                        </div>
                        
          {/* Volunteer List Table */}
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Volunteer
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Location
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Skills
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Availability
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y">
      {filteredVolunteers.length > 0 ? (
        filteredVolunteers.map((volunteer) => (
          <tr key={volunteer.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-4">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedVolunteers.includes(volunteer.id)}
                  onCheckedChange={() => toggleVolunteer(volunteer.id)}
                  aria-label={`Select ${volunteer.name}`}
                  disabled={!selectedVolunteers.includes(volunteer.id) && selectedVolunteers.length >= maxVolunteers}
                />
                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                  <UserPlusIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <div className="font-medium">{volunteer.name}{volunteer.isRecommended && (
      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Recommended</Badge>
    )}</div>
                  <div className="text-sm text-gray-500">{volunteer.email}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4">
              <div>
                <div>{volunteer.location}</div>
                <div className="text-sm text-gray-500">{volunteer.state}</div>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-1">
                {volunteer.skills && volunteer.skills.length > 0 ? (
                  volunteer.skills.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No skills listed</span>
                )}
                {volunteer.skills && volunteer.skills.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{volunteer.skills.length - 2} more
                  </Badge>
                )}
              </div>
            </td>
            <td className="px-4 py-4 text-center">
              <span className={`text-xs px-3 py-1 rounded-full ${
                volunteer.availability === 'both'
                ? 'bg-green-100 text-green-800'
                  : volunteer.availability === 'weekends' || volunteer.availability === 'Weekends'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {volunteer.availability}
              </span>
            </td>
            <td className="px-4 py-4 text-center">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => handleViewVolunteer(volunteer)}
              >
                View
              </Button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
            No volunteers found matching your filters
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !title}
                    className="w-40"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              {/* Volunteer details modal */}
{selectedVolunteer && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Volunteer Profile</h2>
          <Button variant="ghost" size="sm" onClick={closeModal} type="button">
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
      </main>
</AdminLayout>
);

};

export default CreateTask;