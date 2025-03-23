import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Clock, Trash2, User } from 'lucide-react';

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

type AdminTaskKanbanProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
};

const AdminTaskKanban = ({ tasks, onStatusChange, onDelete }: AdminTaskKanbanProps) => {
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

  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === 'Todo');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const reviewTasks = tasks.filter(task => task.status === 'Review');
  const doneTasks = tasks.filter(task => task.status === 'Done');

  // Render task card
  const renderTaskCard = (task: Task) => (
    <div 
      key={task.id}
      className="bg-white rounded-lg shadow-sm border p-4 mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <Button variant="ghost" size="sm" className="p-0 h-auto w-auto" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
        </Button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex justify-between items-center mb-2">
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>

        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>

      {task.assignee ? (
        <div className="flex items-center mt-3 pt-2 border-t border-gray-100">
          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-500" />
          </div>
          <span className="ml-2 text-xs text-gray-600">
            {task.assignee.first_name} {task.assignee.last_name}
          </span>
        </div>
      ) : (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">Unassigned</span>
        </div>
      )}
    </div>
  );

  // Event handlers for drag and drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onStatusChange(taskId, status);
  };

  // Render column
  const renderColumn = (title: string, columnTasks: Task[], status: string) => (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4 min-h-[24rem] w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500">{columnTasks.length}</span>
      </div>
      
      <div 
        className="space-y-3 min-h-[20rem]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {columnTasks.map(task => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
          >
            {renderTaskCard(task)}
                  </div>
                ))}
                
        {columnTasks.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg h-full min-h-[12rem] flex items-center justify-center">
            <p className="text-sm text-gray-400">Drag tasks here</p>
                </div>
              )}
            </div>
          </div>
        );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {renderColumn('To Do', todoTasks, 'Todo')}
      {renderColumn('In Progress', inProgressTasks, 'In Progress')}
      {renderColumn('Review', reviewTasks, 'Review')}
      {renderColumn('Done', doneTasks, 'Done')}
    </div>
  );
};

export default AdminTaskKanban;