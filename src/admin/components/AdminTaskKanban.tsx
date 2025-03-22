import React from 'react';
import dayjs from 'dayjs';

const AdminTaskKanban = ({ tasks }) => {
  // Define standard status columns with colors
  const statusColumns = [
    { name: 'Backlog', color: 'border-red-500 bg-red-100' },
    { name: 'Todo', color: 'border-yellow-500 bg-yellow-100' },
    { name: 'In Progress', color: 'border-blue-500 bg-blue-100' },
    { name: 'In Review', color: 'border-purple-500 bg-purple-100' },
    { name: 'Done', color: 'border-green-500 bg-green-100' },
  ];
  
  // Function to calculate priority and assign color
  const getPriorityColor = (dueDate) => {
    if (!dueDate) return 'border-gray-400'; // Default if no due date
    
    const today = dayjs();
    const due = dayjs(dueDate);
    
    if (due.isBefore(today, 'day')) return 'border-red-500'; // Overdue (High Priority)
    if (due.diff(today, 'day') <= 5) return 'border-orange-500'; // Due in 5 days (Medium Priority)
    
    return 'border-green-500'; // More than 3 days away (Low Priority)
  };

  // Function to extract border color from column color class
  const getBorderColorClass = (colorClass) => {
    return colorClass.split(' ')[0]; // Gets just the border color portion
  };
  
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {statusColumns.map(({ name, color }) => {
        const borderColor = getBorderColorClass(color);
        return (
          <div 
            key={name} 
            className={`flex-shrink-0 w-64 rounded-lg ${color} p-4`}
            style={{ borderTop: `4px solid ${borderColor.replace('border-', '').replace('-500', '')}` }}
          >
            <h3 className="font-bold mb-3">{name}</h3>
            
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === name)
                .map((task) => (
                  <div 
                    key={task.id || task.name} 
                    className={`p-3 bg-white rounded shadow ${getPriorityColor(task.dueDate)} border-l-4`}
                  >
                    <h4 className="font-semibold mb-2">{task.name}</h4>
                    
                    <div className="flex items-center mb-2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm">{task.assignee.name}</p>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">Due: {task.dueDate || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                
              {tasks.filter(task => task.status === name).length === 0 && (
                <div className="text-center py-4 text-gray-500 italic text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminTaskKanban;