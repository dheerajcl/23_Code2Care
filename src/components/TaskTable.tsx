import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { convertTaskToBraille, downloadBraille } from '@/utils/braille';
import { BraillePreviewModal } from '@/admin/components/BraillePreviewModal';
import { toast } from 'sonner';

const TaskTable = ({ tasks, onUpdateStatus }) => {
  const [previewTask, setPreviewTask] = useState(null);

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

  // Handle braille preview and download
  const handleBrailleClick = (task) => {
    setPreviewTask(task);
  };

  const handleDownload = (type) => {
    if (!previewTask) return;

    try {
      const taskData = {
        title: previewTask.name,
        description: previewTask.description,
        status: previewTask.status,
        priority: previewTask.priority || 'Medium',
        due_date: previewTask.dueDate,
        assignee: previewTask.assignee,
        event_name: previewTask.eventTitle || 'Event'
      };

      const content = convertTaskToBraille(taskData);
      downloadBraille(content, `task-${previewTask.id}-braille`, type);
    } catch (error) {
      console.error('Error handling braille download:', error);
      toast.error("Failed to download task in braille format. Please try again.");
    }
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
              <td className="px-6 py-4 whitespace-nowrap pr-3 text-right text-sm font-medium">
                <div className="flex justify-end items-center mr-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBrailleClick(task)}
                          className="relative group hover:bg-blue-50 border-blue-200 ml-auto mr-1"
                        >
                          <div className="flex items-center gap-1">
                            <div className="relative">
                              <div className="flex items-center justify-center w-5 h-5 rounded-sm">
                                <div className="grid grid-cols-2 gap-[2px]">
                                  <div className="w-[3px] h-[3px] rounded-full bg-blue-500"></div>
                                  <div className="w-[3px] h-[3px] rounded-full bg-blue-500"></div>
                                  <div className="w-[3px] h-[3px] rounded-full bg-transparent"></div>
                                  <div className="w-[3px] h-[3px] rounded-full bg-blue-500"></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-blue-500 group-hover:text-blue-600">
                              ⠃⠗
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview & Download in Braille</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {previewTask && (
        <BraillePreviewModal
          isOpen={!!previewTask}
          onClose={() => setPreviewTask(null)}
          brailleText={convertTaskToBraille({
            title: previewTask.name,
            description: previewTask.description,
            status: previewTask.status,
            priority: previewTask.priority || 'Medium',
            due_date: previewTask.dueDate,
            assignee: previewTask.assignee,
            event_name: previewTask.eventTitle || 'Event'
          }).braille}
          originalText={convertTaskToBraille({
            title: previewTask.name,
            description: previewTask.description,
            status: previewTask.status,
            priority: previewTask.priority || 'Medium',
            due_date: previewTask.dueDate,
            assignee: previewTask.assignee,
            event_name: previewTask.eventTitle || 'Event'
          }).original}
          onDownload={handleDownload}
          taskTitle={previewTask.name}
        />
      )}
    </div>
  );
};

export default TaskTable;