import React from 'react';
import { AlertCircle, CheckCircle, Clock, Edit, MoreHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';

const TaskTable = ({ tasks, onUpdateStatus }) => {
  // Function to render status badge with appropriate colors
  const renderStatusBadge = (status) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    let icon = null;

    switch (status) {
      case 'Backlog':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <Clock size={14} className="mr-1" />;
        break;
      case 'Todo':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <Clock size={14} className="mr-1" />;
        break;
      case 'In Progress':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <AlertCircle size={14} className="mr-1" />;
        break;
      case 'In Review':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        icon = <AlertCircle size={14} className="mr-1" />;
        break;
      case 'Done':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircle size={14} className="mr-1" />;
        break;
      default:
        break;
    }

    return (
      <div className={`flex items-center justify-center px-3 py-1 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
        {icon}
        {status}
      </div>
    );
  };

  // Handle status change
  const handleStatusChange = (taskId, newStatus) => {
    onUpdateStatus(taskId, newStatus);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{task.dueDate}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  <Select 
                    defaultValue={task.status} 
                    onValueChange={(value) => handleStatusChange(task.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap pr-12 text-right text-sm font-medium">
                <button aria-label='edit' className="text-rose-700 hover:text-rose-900">
                  <Edit size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;