import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for managing localStorage

export function clearAllAuthData() {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('volunteerUser');
  localStorage.removeItem('user');
  console.log('All auth data cleared from localStorage');
}

export function checkAuthStorage() {
  const adminUser = localStorage.getItem('adminUser');
  const volunteerUser = localStorage.getItem('volunteerUser');
  const user = localStorage.getItem('user');
  
  console.log('Current localStorage auth data:');
  console.log('adminUser:', adminUser ? JSON.parse(adminUser) : null);
  console.log('volunteerUser:', volunteerUser ? JSON.parse(volunteerUser) : null);
  console.log('user:', user ? JSON.parse(user) : null);
  
  return {
    hasAdminUser: !!adminUser,
    hasVolunteerUser: !!volunteerUser,
    hasUser: !!user
  };
}

// Simple function to sync auth data across different storage keys
export function syncAuthData() {
  try {
    // Get admin user
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      const adminUser = JSON.parse(adminData);
      if (adminUser.role === 'admin') {
        localStorage.setItem('user', adminData);
        return true;
      }
    }
    
    // Get volunteer user
    const volunteerData = localStorage.getItem('volunteerUser');
    if (volunteerData) {
      const volunteerUser = JSON.parse(volunteerData);
      if (volunteerUser.role === 'volunteer') {
        localStorage.setItem('user', volunteerData);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error syncing auth data:', error);
    return false;
  }
}

// Format date function
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Check if an event is upcoming (future start date)
export function checkIfEventIsUpcoming(startDate: string): boolean {
  const today = new Date();
  const eventStartDate = new Date(startDate);
  return eventStartDate > today;
}

// Check if an event is currently live (between start and end dates)
export function checkIfEventIsLive(startDate: string, endDate: string): boolean {
  const today = new Date();
  const eventStartDate = new Date(startDate);
  const eventEndDate = new Date(endDate);
  return today >= eventStartDate && today <= eventEndDate;
}
