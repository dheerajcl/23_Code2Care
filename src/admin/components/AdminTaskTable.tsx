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
import { AlertTriangle, Clock, Trash2, User } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assignee_id?: string;
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
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
              Assignee
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
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                  {formatDate(task.due_date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.assignee ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {task.assignee.first_name} {task.assignee.last_name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {confirmDelete === task.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <Button size="sm" variant="ghost" onClick={() => confirmDeleteTask(task.id)}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelDelete}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(task.id)}>
                    <Trash2 className="h-4 w-4" />
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
