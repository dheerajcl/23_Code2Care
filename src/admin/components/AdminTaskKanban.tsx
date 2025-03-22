import React from 'react';

const AdminTaskKanban = ({ tasks }) => {
  // Define standard status columns
  const statusColumns = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
  
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusColumns.map(status => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3">{status}</h3>
            <div className="space-y-3">
              {tasks.filter(task => task.status === status).map((task) => (
                <div key={task.id} className="bg-white p-3 rounded shadow">
                  <div className="font-medium text-gray-800 mb-2">{task.name}</div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                      {task.assignee.initial}
                    </div>
                    <div className="text-xs text-gray-500">{task.dueDate}</div>
                  </div>
                </div>
              ))}
              {tasks.filter(task => task.status === status).length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm italic">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTaskKanban;