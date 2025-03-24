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
