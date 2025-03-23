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
import { CalendarIcon, FilterIcon, CheckIcon, PlusIcon, XIcon, UserPlusIcon, Trash2, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Dummy data for volunteers
const dummyVolunteers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    availability: 'weekends',
    skills: ['Technology', 'Writing'],
    location: 'Bangalore',
    state: 'Karnataka'
  },
  {
    id: 2,
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    availability: 'weekends',
    skills: ['Education', 'Teaching'],
    location: 'Not specified',
    state: 'Karnataka'
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    availability: 'both',
    skills: ['Technology', 'Software'],
    location: 'Bengaluru',
    state: 'Karnataka'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    availability: 'weekdays',
    skills: ['Event Management', 'Design'],
    location: 'Bangalore',
    state: 'Karnataka'
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.lee@example.com',
    availability: 'weekends',
    skills: ['Technology', 'Testing'],
    location: 'Bengaluru',
    state: 'Karnataka'
  },
  {
    id: 6,
    name: 'Jessica Garcia',
    email: 'jessica.g@example.com',
    availability: 'both',
    skills: ['Event Management', 'Administration'],
    location: 'Not specified',
    state: 'Karnataka'
  },
  {
    id: 7,
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    availability: 'Weekends',
    skills: ['Education', 'Teaching'],
    location: 'Bangalore',
    state: 'Karnataka'
  },
  {
    id: 8,
    name: 'Amanda Taylor',
    email: 'amanda.t@example.com',
    availability: 'weekends',
    skills: ['Technology', 'Design'],
    location: 'Bengaluru',
    state: 'Karnataka'
  },
  {
    id: 9,
    name: 'Christopher White',
    email: 'chris.w@example.com',
    availability: 'both',
    skills: ['Education', 'Writing'],
    location: 'Bangalore',
    state: 'Karnataka'
  },
  {
    id: 10,
    name: 'Jennifer Clark',
    email: 'jennifer.c@example.com',
    availability: 'weekends',
    skills: ['Event Management', 'Design'],
    location: 'Not specified',
    state: 'Karnataka'
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
        volunteer.skills.some(skill => skillsFilter.includes(skill))
      );
    }

    // Apply interest filter
    if (interestFilter.length > 0) {
      filtered = filtered.filter(volunteer => 
        volunteer.skills.some(skill => interestFilter.includes(skill))
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

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header would go here */}
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
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
              
              {/* Volunteer Assignment Card - Updated to match the image */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle>Assign Volunteers</CardTitle>
                  <CardDescription>
                    {selectedVolunteers.length} of {maxVolunteers} volunteers selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    >
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </Button>
                    <span className="text-sm text-gray-500">
                      {filteredVolunteers.length} volunteers found
                    </span>
                  </div>
                  
                  {/* Volunteer List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Volunteer</th>
                          <th className="px-4 py-2 text-left">Location</th>
                          <th className="px-4 py-2 text-left">Skills</th>
                          <th className="px-4 py-2 text-center">Availability</th>
                          <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredVolunteers.length > 0 ? (
                          filteredVolunteers.map((volunteer) => (
                            <tr key={volunteer.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <Checkbox
                                    checked={selectedVolunteers.includes(volunteer.id)}
                                    onCheckedChange={() => toggleVolunteer(volunteer.id)}
                                    aria-label={`Select ${volunteer.name}`}
                                    disabled={!selectedVolunteers.includes(volunteer.id) && selectedVolunteers.length >= maxVolunteers}
                                  />
                                  <div className="ml-3">
                                    <div className="font-medium">{volunteer.name}</div>
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
                                  {volunteer.skills.map((skill, index) => (
                                    <span 
                                      key={index} 
                                      className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                  volunteer.availability === 'both' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {volunteer.availability}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant={selectedVolunteers.includes(volunteer.id) ? "destructive" : "default"}
                                    size="sm"
                                    onClick={() => toggleVolunteer(volunteer.id)}
                                    disabled={!selectedVolunteers.includes(volunteer.id) && selectedVolunteers.length >= maxVolunteers}
                                  >
                                    {selectedVolunteers.includes(volunteer.id) ? 'Remove' : 'Assign'}
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                              No volunteers match your search criteria
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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