// src/services/user.service.ts
import { supabase } from '@/lib/supabase';

/**
 * Get the currently authenticated user with their profile details
 * Used by both volunteer and admin modules
 */
export const getCurrentUser = async () => {
  try {
    // Get the basic auth user first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error getting authenticated user:', authError);
      return null;
    }
    
    // Try to get volunteer profile first
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!volunteerError && volunteerData) {
      return volunteerData;
    }
    
    // If not found in volunteers, try admin users
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!adminError && adminData) {
      return adminData;
    }
    
    // Return base user if no profile found
    return {
      id: user.id,
      email: user.email,
      role: 'unknown'
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Check if the current user is a volunteer
 */
export const isVolunteer = async () => {
  const user = await getCurrentUser();
  return user && user.role === 'volunteer';
};

/**
 * Check if the current user is an admin
 */
export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user && user.role === 'admin';
};