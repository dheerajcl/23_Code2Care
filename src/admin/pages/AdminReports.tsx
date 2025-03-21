import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'

const AdminReports = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    
      // Function to handle sidebar toggle
      const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
      };

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Pass the state and toggler to the sidebar */}
        <AdminSidebar initialExpanded={sidebarExpanded} onToggle={handleSidebarToggle} />
          
          {/* Main content area */}
          <main 
            className={`flex-1 transition-all duration-300 overflow-auto p-8
                       ${sidebarExpanded ? 'md:ml-56' : 'md:ml-16'}`}
          >
            Reports
        </main>
    </div>
  )
}

export default AdminReports