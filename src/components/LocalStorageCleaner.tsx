import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component will help us debug localStorage issues
const LocalStorageCleaner: React.FC = () => {
  const location = useLocation();
  
  // Function to clear all user data from localStorage
  const clearAllUserData = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('volunteerUser');
    localStorage.removeItem('user');
    console.log('All user data cleared from localStorage');
  };
  
  // Function to check what's in localStorage
  const checkLocalStorage = () => {
    console.log('Current localStorage contents:');
    console.log('adminUser:', localStorage.getItem('adminUser'));
    console.log('volunteerUser:', localStorage.getItem('volunteerUser'));
    console.log('user:', localStorage.getItem('user'));
  };
  
  useEffect(() => {
    // Check localStorage on component mount
    checkLocalStorage();
    
    // If we're on the landing page and admin/volunteer data exists in localStorage
    // but we're not on an admin or volunteer route, clear the user data
    if (location.pathname === '/' || location.pathname === '/events' || location.pathname === '/about') {
      const adminUser = localStorage.getItem('adminUser');
      const volunteerUser = localStorage.getItem('volunteerUser');
      
      // When on public routes, remove admin user data if it exists
      if (adminUser) {
        console.log('Removing admin user data from localStorage on public route');
        localStorage.removeItem('adminUser');
      }
      
      // When on public routes, remove volunteer user data if it exists  
      if (volunteerUser) {
        console.log('Removing volunteer user data from localStorage on public route');
        localStorage.removeItem('volunteerUser');
      }
      
      // After cleaning, check localStorage again
      checkLocalStorage();
    }
    
    // Uncomment the line below to force clear all user data on all routes
    // clearAllUserData();
  }, [location.pathname]);
  
  // This component doesn't render anything
  return null;
};

export default LocalStorageCleaner; 