import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'

const AdminDashboard = () => {
  // State to track sidebar expansion - need to share between components
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Function to update sidebar state (pass this to the AdminSidebar component)
  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Pass the state and toggler to the sidebar */}
      <AdminSidebar initialExpanded={sidebarExpanded} onToggle={handleSidebarToggle} />
      
      {/* Main content area - dynamically adjusts based on sidebar state */}
      <main 
        className={`flex-1 transition-all duration-300 overflow-auto p-8
                   ${sidebarExpanded ? 'md:ml-56' : 'md:ml-16'}`}
      >
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Dashboard content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Total Volunteers</h2>
            <p className="text-3xl font-bold">245</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Signups</h2>
            <p className="text-3xl font-bold">37</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard