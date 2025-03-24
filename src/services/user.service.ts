// src/services/user.service.ts
import { supabase } from '@/lib/supabase';

/**
 * Get the current logged in user
 * @returns The current user or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) return null;
    
    // Get additional user info from volunteer table
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (volunteerError && volunteerError.code !== 'PGSQL_ERROR') {
      console.error('Error fetching volunteer data:', volunteerError);
      return null;
    }
    
    // Return volunteer data if found, otherwise just the auth user
    return volunteerData || user;
  } catch (error) {
    console.error('Error getting current user:', error);
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