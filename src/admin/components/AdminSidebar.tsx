import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, BarChart2, 
  LogOut, ChevronLeft, ChevronRight, Menu 
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

const AdminSidebar = ({ initialExpanded = true, onToggle }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect is handled by the auth context
  };


  // Check the current URL and set the active item accordingly
  useEffect(() => {
    const path = window.location.pathname;
    
    // Extract the last part of the URL path to determine active page
    const pathSegments = path.split('/');
    const currentPage = pathSegments[pathSegments.length - 1];
    
    // Find the menu item that matches the current path
    const menuItemNames = menuItems.map(item => item.name.toLowerCase());
    if (currentPage && menuItemNames.includes(currentPage)) {
      // Convert first letter to uppercase to match menu item names
      const currentPageCapitalized = 
        currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
      setActiveItem(currentPageCapitalized);
    } else if (path === '/admin/' || path === '/admin') {
      // Default to Dashboard if we're at the root admin path
      setActiveItem('Dashboard');
    }
  }, []);

  // Sync the expanded state with parent component
  useEffect(() => {
    setExpanded(initialExpanded);
  }, [initialExpanded]);

  const toggleSidebar = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    // Notify parent component about the change
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={28} /> },
    { name: 'Events', icon: <Calendar size={28} /> },
    { name: 'Volunteers', icon: <Users size={28} /> },
    { name: 'Reports', icon: <BarChart2 size={28} /> },
  ];

  return (
    <>
      {/* Mobile menu button - visible on small screens */}
      <button
        aria-label="menu-icon"
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-gray-100 text-red-800"
        onClick={toggleMobileSidebar}
      >
        <Menu size={28} />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-red-800 text-white transition-all duration-300 z-10
                   ${expanded ? 'w-56' : 'w-16'} 
                   ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white">
          {expanded && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-red-700 hidden md:block"
          >
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        <div className="pt-4 flex flex-col justify-between h-[calc(100%-64px)]">
          {/* Menu Items */}
          <nav>
            <ul>
              {menuItems.map((item, index) => {
                const isActive = activeItem === item.name;
                return (
                  <li key={index}>
                    <a 
                      href={`/admin/${item.name.toLowerCase()}`}
                      className={`flex items-center px-4 py-3 transition-colors relative
                                ${isActive ? 'bg-red-700 font-bold' : 'hover:bg-red-700'}`}
                      onClick={() => setActiveItem(item.name)}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                      )}
                      
                      <span className={`inline-flex items-center justify-center ${isActive ? 'text-white' : ''}`}>
                        {item.icon}
                      </span>
                      
                      {expanded && <span className="ml-4">{item.name}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Sign Out Button */}
          <div className="mt-auto border-t border-white">
            <div className="flex items-center px-4 py-4 hover:bg-red-700 transition-colors" onClick={handleLogout}>
              <span className="inline-flex items-center justify-center text-white">
                <LogOut size={28}/>
              </span>
              {expanded && <span className="ml-4">Log Out</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;