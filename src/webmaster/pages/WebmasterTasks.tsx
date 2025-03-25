import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebmasterAuth } from '@/lib/authContext';
import { WebmasterHeader } from '../components/WebmasterHeader';
import { WebmasterSidebar } from '../components/WebmasterSidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  Filter,
  Search,
  CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Eye,
  ListFilter,
  X
} from 'lucide-react';
import { getAllTasks } from '@/services/database.service';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import AccessibilityMenu from '@/components/AccessibilityMenu';

export const WebmasterTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWebmasterAuth();
  
  // Data state
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('table');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  // For kanban view
  const [kanbanGroups, setKanbanGroups] = useState({
    todo: [],
    inProgress: [],
    review: [],
    completed: []
  });
  
  // Filters data
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const { data, error } = await getAllTasks();
        
        if (error) throw error;
        
        if (data) {
          // Process tasks data
          const processedTasks = data.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status || 'Todo',
            priority: task.priority || 'Medium',
            dueDate: task.deadline ? new Date(task.deadline) : null,
            eventId: task.event_id,
            eventTitle: task.event?.title || 'No event',
            assignees: task.assignments ? task.assignments.map(a => ({
              id: a.id,
              volunteerId: a.volunteer_id,
              volunteerName: a.volunteer ? `${a.volunteer.first_name || ''} ${a.volunteer.last_name || ''}`.trim() : 'Unassigned',
              status: a.status || 'pending'
            })) : [],
            createdAt: new Date(task.created_at)
          }));
          
          setTasks(processedTasks);
          setFilteredTasks(processedTasks);
          
          // Extract events for filtering
          const uniqueEvents = Array.from(
            new Set(processedTasks.map(task => task.eventId))
          ).map(eventId => {
            const task = processedTasks.find(t => t.eventId === eventId);
            return {
              id: eventId,
              title: task ? task.eventTitle : 'Unknown Event'
            };
          });
          
          setEvents(uniqueEvents);
          
          // Organize tasks for kanban view
          organizeKanbanGroups(processedTasks);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Apply filters when changed
  useEffect(() => {
    if (tasks.length === 0) return;
    
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.eventTitle.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    
    // Apply event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.eventId === eventFilter
      );
    }
    
    setFilteredTasks(filtered);
    organizeKanbanGroups(filtered);
  }, [searchTerm, statusFilter, priorityFilter, eventFilter, tasks]);
  
  // Organize tasks into kanban groups
  const organizeKanbanGroups = (tasksToOrganize) => {
    const groups = {
      todo: [],
      inProgress: [],
      review: [],
      completed: []
    };
    
    tasksToOrganize.forEach(task => {
      const status = task.status.toLowerCase().replace(/\s+/g, '');
      
      if (status === 'todo') {
        groups.todo.push(task);
      } else if (status === 'inprogress') {
        groups.inProgress.push(task);
      } else if (status === 'review') {
        groups.review.push(task);
      } else if (status === 'completed') {
        groups.completed.push(task);
      } else {
        // Default to todo for unknown status
        groups.todo.push(task);
      }
    });
    
    setKanbanGroups(groups);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setEventFilter('all');
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'No deadline';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'todo') return 'bg-gray-100 text-gray-800';
    if (statusLower === 'inprogress') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'review') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'completed') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'bg-red-100 text-red-800';
    if (priorityLower === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (priorityLower === 'low') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'todo') return <Clock className="h-4 w-4" />;
    if (statusLower === 'inprogress') return <AlertCircle className="h-4 w-4" />;
    if (statusLower === 'review') return <Eye className="h-4 w-4" />;
    if (statusLower === 'completed') return <CheckCircle2 className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };
  
  // Handle task click
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };
  
  // Task details dialog
  const renderTaskDetailsDialog = () => {
    if (!selectedTask) return null;
    
    return (
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              View detailed information about this task
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-1">{selectedTask.status}</span>
                  </Badge>
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority} Priority
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Created: {formatDate(selectedTask.createdAt)}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Event</h3>
              <p className="text-sm">{selectedTask.eventTitle}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{selectedTask.description || 'No description provided'}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
              <p className="text-sm">{formatDate(selectedTask.dueDate)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
              {selectedTask.assignees.length > 0 ? (
                <div className="space-y-2">
                  {selectedTask.assignees.map(assignee => (
                    <div key={assignee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{assignee.volunteerName}</p>
                      </div>
                      <Badge className={
                        assignee.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        assignee.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {assignee.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No assignees</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render the table view
  const renderTableView = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={task.title}>
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 truncate" title={task.description}>
                        {task.description.substring(0, 60)}{task.description.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{task.eventTitle}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {task.assignees.length > 0 ? (
                        task.assignees.map((assignee, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="text-xs">{assignee.volunteerName}</span>
                            <Badge className="text-[10px] px-1" variant="outline">
                              {assignee.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTask(task)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || eventFilter !== 'all' ? (
                    <div>
                      <p className="text-gray-500 mb-2">No tasks match your filters</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No tasks available</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Render the kanban view
  const renderKanbanView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Todo Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              To Do <span className="ml-2 text-xs text-gray-500">({kanbanGroups.todo.length})</span>
            </h3>
          </div>
          
          <div className="space-y-3">
            {kanbanGroups.todo.map(task => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewTask(task)}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(task.dueDate)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{task.eventTitle}</p>
                  
                  {task.assignees.length > 0 && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {kanbanGroups.todo.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                No tasks
              </div>
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
              In Progress <span className="ml-2 text-xs text-gray-500">({kanbanGroups.inProgress.length})</span>
            </h3>
          </div>
          
          <div className="space-y-3">
            {kanbanGroups.inProgress.map(task => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewTask(task)}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(task.dueDate)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{task.eventTitle}</p>
                  
                  {task.assignees.length > 0 && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {kanbanGroups.inProgress.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                No tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Review Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-yellow-500" />
              Review <span className="ml-2 text-xs text-gray-500">({kanbanGroups.review.length})</span>
            </h3>
          </div>
          
          <div className="space-y-3">
            {kanbanGroups.review.map(task => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewTask(task)}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(task.dueDate)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{task.eventTitle}</p>
                  
                  {task.assignees.length > 0 && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {kanbanGroups.review.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                No tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Completed Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Completed <span className="ml-2 text-xs text-gray-500">({kanbanGroups.completed.length})</span>
            </h3>
          </div>
          
          <div className="space-y-3">
            {kanbanGroups.completed.map(task => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewTask(task)}>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(task.dueDate)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{task.eventTitle}</p>
                  
                  {task.assignees.length > 0 && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {kanbanGroups.completed.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-500">
                No tasks
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-screen bg-gray-100 overflow-hidden pt-16">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <WebmasterHeader />
        <div className="flex h-screen bg-gray-100 overflow-hidden pt-16">
          <WebmasterSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <WebmasterHeader />
      <div className="flex h-screen bg-gray-100 overflow-hidden pt-16">
        <WebmasterSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <p className="text-gray-500">View and monitor task progress</p>
              </div>
              
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Read-only View
              </Badge>
            </div>
          </div>
          
          {/* Filters and controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || eventFilter !== 'all') && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {(statusFilter !== 'all' ? 1 : 0) + 
                       (priorityFilter !== 'all' ? 1 : 0) + 
                       (eventFilter !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
                
                <Tabs 
                  defaultValue="table" 
                  value={viewType} 
                  onValueChange={setViewType}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Filter Options</h3>
                  
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || eventFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-8 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Status
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="inprogress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Priority
                    </label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Event
                    </label>
                    <Select value={eventFilter} onValueChange={setEventFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
          
          {/* Main content - either table or kanban */}
          {viewType === 'table' ? renderTableView() : renderKanbanView()}
          
          {/* Task details dialog */}
          {renderTaskDetailsDialog()}
        </main>
      </div>
      <AccessibilityMenu />
    </div>
  );
};