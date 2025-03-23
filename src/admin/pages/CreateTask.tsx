import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import AdminSidebar from '../components/AdminSidebar';
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
import { CalendarIcon, FilterIcon, CheckIcon, PlusIcon, XIcon, UserPlusIcon, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Dummy data for volunteers
const dummyVolunteers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    availability: 'weekdays',
    category: 'technology',
    profile_image: null
  },
  {
    id: 2,
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    availability: 'weekends',
    category: 'education',
    profile_image: null
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    availability: 'both',
    category: 'technology',
    profile_image: null
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    availability: 'weekdays',
    category: 'workshop',
    profile_image: null
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.lee@example.com',
    availability: 'weekends',
    category: 'technology',
    profile_image: null
  },
  {
    id: 6,
    name: 'Jessica Garcia',
    email: 'jessica.g@example.com',
    availability: 'both',
    category: 'workshop',
    profile_image: null
  },
  {
    id: 7,
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    availability: 'weekdays',
    category: 'education',
    profile_image: null
  },
  {
    id: 8,
    name: 'Amanda Taylor',
    email: 'amanda.t@example.com',
    availability: 'weekends',
    category: 'technology',
    profile_image: null
  },
  {
    id: 9,
    name: 'Christopher White',
    email: 'chris.w@example.com',
    availability: 'both',
    category: 'education',
    profile_image: null
  },
  {
    id: 10,
    name: 'Jennifer Clark',
    email: 'jennifer.c@example.com',
    availability: 'weekdays',
    category: 'workshop',
    profile_image: null
  }
];

const CreateTask = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  // Task State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(1);
  const [status, setStatus] = useState('todo');
  const [deadline, setDeadline] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  
  // Reference Data
  const [allVolunteers, setAllVolunteers] = useState(dummyVolunteers);
  const [filteredVolunteers, setFilteredVolunteers] = useState(dummyVolunteers);
  
  // Volunteer Filter State
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'both', label: 'Both' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'education', label: 'Education' }
  ];

  useEffect(() => {
    // Apply filters to volunteers
    let filtered = [...allVolunteers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(volunteer => 
        volunteer.name?.toLowerCase().includes(query) || 
        volunteer.email?.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(volunteer => 
        volunteer.availability === availabilityFilter
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(volunteer => 
        volunteer.category === categoryFilter
      );
    }

    setFilteredVolunteers(filtered);
  }, [allVolunteers, searchQuery, availabilityFilter, categoryFilter]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          max_volunteers: maxVolunteers,
          status,
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
          created_by: auth.user?.id,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (taskError) throw taskError;
      
      const taskId = taskData.id;
      
      // Assign volunteers
      if (selectedVolunteers.length > 0) {
        const volunteerAssignments = selectedVolunteers.map(volunteerId => ({
          task_id: taskId,
          volunteer_id: volunteerId,
          assigned_at: new Date().toISOString(),
          status: 'assigned'
        }));
        
        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(volunteerAssignments);
          
        if (assignmentError) throw assignmentError;
      }
      
      toast.success('Task created successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header would go here */}
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
            
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
                      <Label htmlFor="maxVolunteers">Maximum Volunteers</Label>
                      <Input 
                        id="maxVolunteers" 
                        type="number" 
                        min="1"
                        value={maxVolunteers} 
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
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
              
              {/* Volunteer Assignment Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Assign Volunteers</CardTitle>
                  <CardDescription>
                    {selectedVolunteers.length} of {maxVolunteers} volunteers selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Search volunteers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      >
                        <FilterIcon className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </div>
                    
                    {isFiltersOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md mb-4 bg-gray-50">
                        <div>
                          <Label>Availability</Label>
                          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All availability</SelectItem>
                              {availabilityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Category</Label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All categories</SelectItem>
                              {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAvailabilityFilter('');
                              setCategoryFilter('');
                              setSearchQuery('');
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted rounded-md p-3 mb-2">
                    <div className="text-sm flex justify-between items-center">
                      <span>
                        Showing {filteredVolunteers.length} volunteers
                        {(availabilityFilter || categoryFilter) && " with filters"}
                      </span>
                      <span className="font-medium">
                        {selectedVolunteers.length} / {maxVolunteers} selected
                      </span>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    {filteredVolunteers.length > 0 ? (
                      <div className="divide-y">
                        {filteredVolunteers.map((volunteer) => (
                          <div
                            key={volunteer.id}
                            className="flex items-center p-4 hover:bg-gray-50"
                          >
                            <div className="flex-grow">
                              <div className="font-medium">
                                {volunteer.name || 'Unnamed'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {volunteer.email || 'No email'}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                  {volunteer.availability}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                  {volunteer.category}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant={selectedVolunteers.includes(volunteer.id) ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleVolunteer(volunteer.id)}
                              disabled={!selectedVolunteers.includes(volunteer.id) && selectedVolunteers.length >= maxVolunteers}
                            >
                              {selectedVolunteers.includes(volunteer.id) ? (
                                <>
                                  <Trash2 className='h-4 w-4 mr-1'/>Remove
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="h-4 w-4 mr-1" /> Assign
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        No volunteers match your filters
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Selected Volunteers Summary */}
              {selectedVolunteers.length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle>Selected Volunteers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedVolunteers.map(id => {
                        const volunteer = allVolunteers.find(v => v.id === id);
                        return (
                          <Badge key={id} variant="secondary" className="py-2 pl-3 pr-2 flex items-center gap-1">
                            {volunteer?.name}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5" 
                              onClick={() => toggleVolunteer(id)}
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/tasks')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Task...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTask;