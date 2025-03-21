import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { Calendar, Plus, Clock, CheckCircle } from 'lucide-react'

const AdminEvents = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for events
  const upcomingEvents = [
    { id: 1, title: "Community Cleanup", date: "April 10, 2025", location: "Central Park", registrations: 45 },
    { id: 2, title: "Charity Fundraiser", date: "April 15, 2025", location: "City Hall", registrations: 78 },
    { id: 3, title: "Workshop Series", date: "April 25, 2025", location: "Community Center", registrations: 32 }
  ];

  const liveEvents = [
    { id: 4, title: "Blood Donation Drive", date: "March 21, 2025", location: "Downtown Hospital", participants: 56 }
  ];

  const pastEvents = [
    { id: 5, title: "Winter Coat Drive", date: "February 15, 2025", location: "Main Street", participants: 123 },
    { id: 6, title: "Food Bank Volunteering", date: "March 1, 2025", location: "Food Bank Warehouse", participants: 67 },
    { id: 7, title: "Senior Center Visit", date: "March 10, 2025", location: "Sunshine Senior Home", participants: 28 }
  ];

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Events Management</h1>
          <button className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-4 px-1 ${activeTab === 'upcoming' 
                ? 'border-b-2 border-red-700 text-red-700 font-medium' 
                : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Upcoming Events</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`pb-4 px-1 ${activeTab === 'live' 
                ? 'border-b-2 border-red-700 text-red-700 font-medium' 
                : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>Live Events</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-4 px-1 ${activeTab === 'past' 
                ? 'border-b-2 border-red-700 text-red-700 font-medium' 
                : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                <span>Past Events</span>
              </div>
            </button>
          </nav>
        </div>
        
        {/* Event lists based on active tab */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'upcoming' ? 'Registrations' : 'Participants'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Render events based on active tab */}
                {activeTab === 'upcoming' && upcomingEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.registrations}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-red-700 hover:text-red-900 mr-3">Edit</a>
                      <a href="#" className="text-gray-700 hover:text-gray-900">View</a>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'live' && liveEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.participants}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-green-600 hover:text-green-800 mr-3">Live View</a>
                      <a href="#" className="text-gray-700 hover:text-gray-900">Manage</a>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'past' && pastEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.participants}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-blue-600 hover:text-blue-800 mr-3">Report</a>
                      <a href="#" className="text-gray-700 hover:text-gray-900">View</a>
                    </td>
                  </tr>
                ))}
                
                {/* Show message if no events */}
                {((activeTab === 'upcoming' && upcomingEvents.length === 0) ||
                  (activeTab === 'live' && liveEvents.length === 0) ||
                  (activeTab === 'past' && pastEvents.length === 0)) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No events to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminEvents