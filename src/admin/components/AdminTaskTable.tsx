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
import { AlertTriangle, Clock, Trash2, User, UserCheck, UserX, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee_id?: string;
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

  // Get assignment status badge
  const getAssignmentStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'accept':
        return <Badge className="bg-green-100 text-green-800 ml-1"><UserCheck className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
      case 'reject':
        return <Badge className="bg-red-100 text-red-800 ml-1"><UserX className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800 ml-1"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 ml-1">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
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
              Assignees
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                {task.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                  <SelectTrigger className="w-[130px]">
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
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(task.due_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  {task.assignees && task.assignees.length > 0 ? (
                    <TooltipProvider>
                      {task.assignees.map((assignee, index) => (
                        <div key={index} className="flex items-center">
                          <div className="text-sm text-gray-900 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {assignee.name}
                            <Tooltip>
                              <TooltipTrigger>
                                {getAssignmentStatusBadge(assignee.notification_status || assignee.status)}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Email: {assignee.email}</p>
                                <p>Status: {assignee.notification_status || assignee.status}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </TooltipProvider>
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Not assigned
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {confirmDelete === task.id ? (
                  <div className="flex items-center justify-end">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs mr-2">Confirm?</span>
                    <Button
                      variant="destructive"
                      className="mr-1"
                      size="sm"
                      onClick={() => confirmDeleteTask(task.id)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelDelete}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
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
