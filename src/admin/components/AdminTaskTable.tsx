import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, Loader2, Trash2, User, UserCheck, UserX, Users, FileDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { convertTaskToBraille, downloadBraille } from '@/utils/braille';
import { toast } from 'sonner';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  originalStatus?: string;
  priority: string;
  due_date?: string;
  assignee_id?: string;
  event_name?: string;
  assignees?: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    assignment_id: string;
    notification_status: string;
  }>;
};

type AdminTaskTableProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
};

const AdminTaskTable = ({ tasks, onStatusChange, onDelete }: AdminTaskTableProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Handle status change
  const handleStatusChange = (taskId: string, newStatus: string) => {
    onStatusChange(taskId, newStatus);
  };

  // Handle delete confirmation
  const handleDeleteClick = (taskId: string) => {
    setConfirmDelete(taskId);
  };

  // Confirm delete
  const confirmDeleteTask = (taskId: string) => {
    onDelete(taskId);
    setConfirmDelete(null);
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get assignment status color and info
  const getAssignmentStatusDetails = (status?: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-gray-100 text-gray-800', label: 'Pending', icon: <Clock className="h-3 w-3 mr-1" /> };
      case 'accepted':
        return { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" /> };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', label: 'Completed', icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: <UserX className="h-3 w-3 mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown', icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
    }
  };

  // Calculate task completion progress
  const calculateTaskProgress = (task: Task) => {
    if (!task.assignees || task.assignees.length === 0) return 0;
    
    const completedCount = task.assignees.filter(a => a.status === 'completed').length;
    return Math.round((completedCount / task.assignees.length) * 100);
  };

  // Handle braille download
  const handleBrailleDownload = (task: Task) => {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority || 'Medium',
        due_date: task.due_date,
        assignee: task.assignees?.[0] ? { name: task.assignees[0].name } : undefined,
        event_name: task.event_name || 'Event'
      };

      const brailleText = convertTaskToBraille(taskData);
      if (brailleText.startsWith('Error')) {
        throw new Error('Failed to convert task to braille');
      }
      downloadBraille(brailleText, `task-${task.id}-braille.txt`);
    } catch (error) {
      console.error('Error handling braille download:', error);
      toast.error("Failed to download task in braille format. Please try again.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volunteers</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                {task.description && (
                  <div className="text-sm text-gray-500 truncate max-w-md">{task.description}</div>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(task.due_date)}</td>
              <td className="px-4 py-4">
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </td>
              <td className="px-4 py-4">
                <Select
                  value={task.status}
                  onValueChange={(value) => onStatusChange(task.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">
                      <Badge className={getStatusColor('Todo')}>Todo</Badge>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <Badge className={getStatusColor('In Progress')}>In Progress</Badge>
                    </SelectItem>
                    <SelectItem value="Review">
                      <Badge className={getStatusColor('Review')}>Review</Badge>
                    </SelectItem>
                    <SelectItem value="Done">
                      <Badge className={getStatusColor('Done')}>Done</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                  {task.assignees && task.assignees.length > 0 ? (
                    task.assignees.map((assignee) => (
                      <TooltipProvider key={assignee.assignment_id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm">
                              <User className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="truncate max-w-[120px]">{assignee.name}</span>
                              <Badge 
                                className={`ml-2 px-1.5 py-0.5 text-xs ${getAssignmentStatusDetails(assignee.status).color}`}
                              >
                                <div className="flex items-center">
                                  {getAssignmentStatusDetails(assignee.status).icon}
                                  <span>{getAssignmentStatusDetails(assignee.status).label}</span>
                                </div>
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{assignee.email}</p>
                            <p>Status: {getAssignmentStatusDetails(assignee.status).label}</p>
                            <p>Notification: {assignee.notification_status || 'None'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No volunteers assigned</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="w-full">
                  {task.assignees && task.assignees.length > 0 ? (
                    <div className="space-y-1">
                      <Progress value={calculateTaskProgress(task)} className="h-2" />
                      <div className="text-xs text-gray-500 text-right">
                        {task.assignees.filter(a => a.status === 'completed').length} / {task.assignees.length} completed
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">N/A</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                {confirmDelete === task.id ? (
                  <div className="flex justify-end items-center gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => confirmDeleteTask(task.id)}
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={cancelDelete}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBrailleDownload(task)}
                            className="hover:bg-blue-50"
                          >
                            <FileDown className="h-4 w-4 text-blue-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download in Braille</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(task.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTaskTable;
