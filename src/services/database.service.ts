import { supabase } from '@/lib/supabase';

// Define types based on database schema
export interface Event {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_id?: string;
  status: string; // 'Upcoming', 'Active', 'Completed'
  category?: string; // New field for event category
  max_volunteers?: number;
  image_url?: string;
  image_file?: File; // Not stored in DB, used for uploading
  created_at?: string;
  updated_at?: string;
}

export interface Volunteer {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  experience?: string;
  how_heard?: string;
  status?: string; // 'Active', 'Inactive', 'Pending'
  rating?: number;
  profile_image?: string;
  badges?: string[];
  bio?: string;
  last_active?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

// Add Task interface after existing interfaces
export interface Task {
  id?: string;
  title: string;
  description?: string;
  event_id: string;
  assignee_id?: string;
  assignee_type?: 'admin' | 'volunteer';
  status?: string;
  due_date?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to ensure authentication
const ensureAuthenticated = async () => {
  try {
    // Temporary bypass for development purposes
    console.log('Authentication check bypassed for development');
    return { user: { id: 'dev-user' } };
    
    /* Original authentication logic commented out for now
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Check if we have a token in localStorage
      const tokenStr = localStorage.getItem('supabase.auth.token');
      if (tokenStr) {
        try {
          // Try to refresh the session
          const { data, error } = await supabase.auth.refreshSession();
          if (error || !data.session) throw error;
          return data.session;
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          localStorage.removeItem('supabase.auth.token');
          throw new Error('Authentication required');
        }
      } else {
        console.error('No active session found. User is not authenticated.');
        throw new Error('Authentication required');
      }
    }
    
    return session;
    */
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication required');
  }
};

// Event CRUD functions
export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], error };
  }
};

export const getEventById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    return { data: null, error };
  }
};

export const createEvent = async (eventData: Event) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    // If there's an image file, upload it first
    let imageUrl = eventData.image_url;
    if (eventData.image_file) {
      const file = eventData.image_file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      // Store directly in 'images' bucket instead of a subfolder
      const filePath = `${fileName}`;
      
      // Upload directly - assume bucket already exists from SQL script
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload image. The storage bucket might not exist or you may not have permission to upload.');
      }
    }
    
    // Handle status and category properly
    let { status, category } = eventData;
    
    // If status contains a category value, move it to category
    if (status && ['Education', 'Health', 'Environment', 'Technology', 'Arts', 'Community Development'].includes(status)) {
      category = status;
      
      // Set status based on dates
      const now = new Date();
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date);
      
      if (startDate > now) {
        status = 'Upcoming';
      } else if (startDate <= now && endDate >= now) {
        status = 'Active';
      } else {
        status = 'Completed';
      }
    }
    
    // Remove the image_file from the data
    const { image_file, ...restEventData } = eventData;
    
    // Prepare final event data
    const finalEventData = {
      ...restEventData,
      status,
      category,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log("Event data being sent to Supabase:", finalEventData);
    
    const { data, error } = await supabase
      .from('event')
      .insert(finalEventData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
};

export const updateEvent = async (id: string, eventData: Partial<Event>) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    // If there's a new image file, upload it first
    let imageUrl = eventData.image_url;
    if (eventData.image_file) {
      const file = eventData.image_file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      // Store directly in 'images' bucket instead of a subfolder
      const filePath = `${fileName}`;
      
      // Upload directly - assume bucket already exists from SQL script
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload image. The storage bucket might not exist or you may not have permission to upload.');
      }
    }
    
    // Handle status and category properly
    let { status, category } = eventData;
    
    // If status contains a category value, move it to category
    if (status && ['Education', 'Health', 'Environment', 'Technology', 'Arts', 'Community Development'].includes(status)) {
      category = status;
      
      // Get the event to determine dates if not provided
      const { data: existingEvent } = await supabase
        .from('event')
        .select('start_date, end_date')
        .eq('id', id)
        .single();
      
      // Set status based on dates
      const now = new Date();
      const startDate = new Date(eventData.start_date || existingEvent.start_date);
      const endDate = new Date(eventData.end_date || existingEvent.end_date);
      
      if (startDate > now) {
        status = 'Upcoming';
      } else if (startDate <= now && endDate >= now) {
        status = 'Active';
      } else {
        status = 'Completed';
      }
    }
    
    // Remove the image_file from the data
    const { image_file, ...restEventData } = eventData;
    
    // Prepare the update data
    const finalEventData = {
      ...restEventData,
      ...(status && { status }),
      ...(category && { category }),
      ...(imageUrl && { image_url: imageUrl }),
      updated_at: new Date().toISOString(),
    };
    
    console.log("Event update data being sent to Supabase:", finalEventData);
    
    const { data, error } = await supabase
      .from('event')
      .update(finalEventData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating event with id ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteEvent = async (id: string) => {
  try {
    // First delete all related tasks
    try {
      console.log('Deleting related tasks for event:', id);
      const { error: taskDeleteError } = await supabase
        .from('task')
        .delete()
        .eq('event_id', id);
      
      if (taskDeleteError) {
        console.log('Error deleting related tasks, continuing:', taskDeleteError);
      }
    } catch (taskError) {
      console.log('Error with task deletion, continuing:', taskError);
    }
    
    // Then try to delete related signups
    try {
      console.log('Deleting related signups for event:', id);
      const { error: signupDeleteError } = await supabase
        .from('event_signup')
        .delete()
        .eq('event_id', id);
      
      if (signupDeleteError) {
        console.log('Error deleting related signups, continuing:', signupDeleteError);
      }
    } catch (signupError) {
      console.log('Error with signup deletion, continuing:', signupError);
    }
    
    // Now delete the event itself
    console.log('Now deleting the event:', id);
    const { error } = await supabase
      .from('event')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase event delete error:', error);
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting event with id ${id}:`, error);
    return { success: false, error };
  }
};

// Volunteer CRUD functions
export const getVolunteers = async () => {
  try {
    // First get all volunteer data
    const { data: volunteers, error: volunteersError } = await supabase
      .from('volunteer')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (volunteersError) throw volunteersError;
    
    if (!volunteers || volunteers.length === 0) {
      return { data: [], error: null };
    }
    
    // Get event signup data for all volunteers
    const volunteerIds = volunteers.map(v => v.id);
    
    // Try first with event_signup table
    let signups = null;
    let signupsError = null;
    
    try {
      // First try to get data from event_signup
      const result = await supabase
        .from('event_signup')
        .select('volunteer_id, event_id, hours')
        .in('volunteer_id', volunteerIds);
        
      signups = result.data;
      signupsError = result.error;
    } catch (e) {
      console.log('Error trying event_signup table:', e);
      // If that fails, try event_registration
      try {
        const result = await supabase
          .from('event_registration')
          .select('volunteer_id, event_id, hours_served')
          .in('volunteer_id', volunteerIds);
          
        signups = result.data;
        signupsError = result.error;
        
        // Map hours_served to hours to match expected schema
        if (signups) {
          signups = signups.map(s => ({
            ...s,
            hours: s.hours_served,
          }));
        }
      } catch (err) {
        signupsError = err;
      }
    }
    
    if (signupsError) throw signupsError;
    
    // Calculate stats for each volunteer
    const volunteerStats = {};
    
    // Initialize stats for each volunteer
    volunteers.forEach(v => {
      volunteerStats[v.id] = {
        totalEvents: 0,
        totalHours: 0,
        eventsAttended: []
      };
    });
    
    // Process signups to calculate stats
    if (signups && signups.length > 0) {
      signups.forEach(signup => {
        const volunteerId = signup.volunteer_id;
        
        // Count all events since we don't know if they have an attended field
        volunteerStats[volunteerId].eventsAttended.push(signup.event_id);
        volunteerStats[volunteerId].totalHours += parseFloat(signup.hours) || 0;
      });
      
      // Calculate unique events attended
      Object.keys(volunteerStats).forEach(id => {
        volunteerStats[id].totalEvents = new Set(volunteerStats[id].eventsAttended).size;
      });
    }
    
    // Combine volunteer data with their stats
    const enrichedVolunteers = volunteers.map(volunteer => ({
      ...volunteer,
      events: volunteerStats[volunteer.id].totalEvents,
      hours: volunteerStats[volunteer.id].totalHours,
      // Ensure these properties exist with defaults if not in DB
      status: volunteer.status || 'Active',
      rating: volunteer.rating || 5.0,
    }));
    
    return { data: enrichedVolunteers, error: null };
  } catch (error) {
    console.error('Error fetching volunteers with stats:', error);
    return { data: [], error };
  }
};

export const getVolunteerById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching volunteer with id ${id}:`, error);
    return { data: null, error };
  }
};

export const createVolunteer = async (volunteerData: Partial<Volunteer>) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .insert([{
        ...volunteerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating volunteer:', error);
    return { data: null, error };
  }
};

export const updateVolunteer = async (id: string, volunteerData: Partial<Volunteer>) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .update({
        ...volunteerData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating volunteer with id ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteVolunteer = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting volunteer with id ${id}:`, error);
    return { success: false, error };
  }
};

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get total volunteers count
    const { count: totalVolunteers, error: volunteersError } = await supabase
      .from('volunteer')
      .select('*', { count: 'exact', head: true });
    
    if (volunteersError) throw volunteersError;
    
    // Get total events count
    const { count: totalEvents, error: eventsError } = await supabase
      .from('event')
      .select('*', { count: 'exact', head: true });
    
    if (eventsError) throw eventsError;
    
    // Get new volunteers in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { count: newVolunteers, error: newVolunteersError } = await supabase
      .from('volunteer')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneMonthAgo.toISOString());
    
    if (newVolunteersError) throw newVolunteersError;
    
    // Get active events (current and future)
    const now = new Date().toISOString();
    const { count: activeEvents, error: activeEventsError } = await supabase
      .from('event')
      .select('*', { count: 'exact', head: true })
      .gte('end_date', now);
    
    if (activeEventsError) throw activeEventsError;
    
    return {
      totalVolunteers: totalVolunteers || 0,
      totalEvents: totalEvents || 0,
      newVolunteers: newVolunteers || 0,
      activeEvents: activeEvents || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return {
      totalVolunteers: 0,
      totalEvents: 0,
      newVolunteers: 0,
      activeEvents: 0,
      error
    };
  }
};

// Event registrations
export const getEventRegistrations = async (eventId: string) => {
  try {
    // First try to join with volunteer_id directly
    const { data, error } = await supabase
      .from('event_registration')
      .select(`
        id,
        event_id,
        volunteer_id,
        registration_date,
        status,
        hours_served,
        feedback,
        volunteer:volunteer_id(*)
      `)
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error with initial query, trying fallback:', error);
      
      // Fallback: Fetch registrations and volunteers separately
      const { data: registrations, error: regError } = await supabase
        .from('event_registration')
        .select('*')
        .eq('event_id', eventId);
      
      if (regError) throw regError;
      
      // If we have registrations, fetch volunteers for each one
      if (registrations && registrations.length > 0) {
        const volunteerIds = registrations.map(reg => reg.volunteer_id);
        const { data: volunteers, error: volError } = await supabase
          .from('volunteer')
          .select('*')
          .in('id', volunteerIds);
          
        if (volError) throw volError;
        
        // Manually join the data
        const enrichedData = registrations.map(reg => {
          const volunteer = volunteers.find(v => v.id === reg.volunteer_id);
          return {
            ...reg,
            volunteer: volunteer || null
          };
        });
        
        return { data: enrichedData, error: null };
      }
      
      return { data: registrations || [], error: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error);
    return { data: [], error };
  }
};

export const registerVolunteerForEvent = async (eventId: string, volunteerId: string, registrationData = {}) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('event_registration')
      .insert([{
        event_id: eventId,
        volunteer_id: volunteerId,
        status: 'registered',
        ...registrationData,
        registration_date: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error registering volunteer for event:', error);
    return { data: null, error };
  }
};

export const updateEventRegistration = async (id: string, registrationData) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('event_registration')
      .update(registrationData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating registration with id ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteEventRegistration = async (id: string) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('event_registration')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting registration with id ${id}:`, error);
    return { success: false, error };
  }
};

// Tasks related to events
export const createTask = async (taskData) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    // Make sure assignee_type is set based on the assignee_id
    const finalTaskData = {
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // If assignee_id is provided but assignee_type is not, default to 'admin'
    if (finalTaskData.assignee_id && !finalTaskData.assignee_type) {
      finalTaskData.assignee_type = 'admin'; // Default to admin if not specified
    }
    
    const { data, error } = await supabase
      .from('task')
      .insert([finalTaskData])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
};

export const getTasksByEventId = async (eventId: string) => {
  try {
    // Get tasks for the event
    const { data: tasks, error: taskError } = await supabase
      .from('task')
      .select('*')
      .eq('event_id', eventId);
    
    if (taskError) throw taskError;
    
    // If there are tasks, enrich them with assignee data
    if (tasks && tasks.length > 0) {
      // Group tasks by assignee type
      const adminTasks = tasks.filter(task => task.assignee_type === 'admin' && task.assignee_id);
      const volunteerTasks = tasks.filter(task => task.assignee_type === 'volunteer' && task.assignee_id);
      const unassignedTasks = tasks.filter(task => !task.assignee_id);
      
      // Get all admin assignees in one query
      let adminAssignees = [];
      if (adminTasks.length > 0) {
        const adminIds = [...new Set(adminTasks.map(task => task.assignee_id))];
        const { data: admins, error: adminError } = await supabase
          .from('admin')
          .select('id, first_name, last_name, email')
          .in('id', adminIds);
        
        if (adminError) console.error('Error fetching admin assignees:', adminError);
        adminAssignees = admins || [];
      }
      
      // Get all volunteer assignees in one query
      let volunteerAssignees = [];
      if (volunteerTasks.length > 0) {
        const volunteerIds = [...new Set(volunteerTasks.map(task => task.assignee_id))];
        const { data: volunteers, error: volunteerError } = await supabase
          .from('volunteer')
          .select('id, first_name, last_name, email')
          .in('id', volunteerIds);
        
        if (volunteerError) console.error('Error fetching volunteer assignees:', volunteerError);
        volunteerAssignees = volunteers || [];
      }
      
      // Combine all tasks with their assignee data
      const enrichedTasks = tasks.map(task => {
        if (!task.assignee_id) {
          return { ...task, assignee: null };
        }
        
        if (task.assignee_type === 'admin') {
          const assignee = adminAssignees.find(admin => admin.id === task.assignee_id);
          return { ...task, assignee };
        } else {
          const assignee = volunteerAssignees.find(volunteer => volunteer.id === task.assignee_id);
          return { ...task, assignee };
        }
      });
      
      return { data: enrichedTasks, error: null };
    }
    
    return { data: tasks || [], error: null };
  } catch (error) {
    console.error(`Error fetching tasks for event ${eventId}:`, error);
    return { data: [], error };
  }
};

export const updateTask = async (id: string, taskData) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    // Make sure assignee_type is set based on the assignee_id
    const finalTaskData = {
      ...taskData,
      updated_at: new Date().toISOString(),
    };
    
    // If assignee_id is provided but assignee_type is not, default to 'admin'
    if (finalTaskData.assignee_id && 
        (taskData.assignee_type === undefined || taskData.assignee_type === null)) {
      finalTaskData.assignee_type = 'admin'; // Default to admin if not specified
    }
    
    const { data, error } = await supabase
      .from('task')
      .update(finalTaskData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating task with id ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteTask = async (id: string) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('task')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    return { success: false, error };
  }
};

// Add sample data to the database for testing
export const addSampleData = async () => {
  try {
    // First, check if data already exists
    const { data: existingEvents } = await supabase
      .from('event')
      .select('id')
      .limit(1);
    
    if (existingEvents && existingEvents.length > 0) {
      return { success: true, message: 'Sample data already exists', error: null };
    }
    
    // Add sample admin if not exists
    const { data: existingAdmins } = await supabase
      .from('admin')
      .select('id')
      .limit(1);
    
    if (!existingAdmins || existingAdmins.length === 0) {
      await supabase.from('admin').insert([
        {
          email: 'admin@samarthanam.org',
          first_name: 'Admin',
          last_name: 'User',
          password: '$2a$10$dq6XgCm8qzAOtbHnqYBF2.3fBCZl9tNF8oVuN2RwUzukN3jxK.i1C', // hashed password for "password123"
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);
    }
    
    // Add sample volunteers
    const volunteers = [
      {
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: '$2a$10$dq6XgCm8qzAOtbHnqYBF2.3fBCZl9tNF8oVuN2RwUzukN3jxK.i1C',
        phone: '(555) 123-4567',
        address: '123 Main St',
        city: 'Bangalore',
        state: 'Karnataka',
        skills: ['Teaching', 'Event Management'],
        interests: ['Education', 'Community Development'],
        availability: 'Weekends',
        experience: 'Worked with local food banks and shelters',
        how_heard: 'Social Media',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        password: '$2a$10$dq6XgCm8qzAOtbHnqYBF2.3fBCZl9tNF8oVuN2RwUzukN3jxK.i1C',
        phone: '(555) 987-6543',
        address: '456 Oak Ave',
        city: 'Mumbai',
        state: 'Maharashtra',
        skills: ['Technology', 'Design'],
        interests: ['Technology', 'Arts'],
        availability: 'Weekdays',
        experience: 'Assisted in coding bootcamps for underprivileged students',
        how_heard: 'Friend Recommendation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    const { error: volunteersError } = await supabase.from('volunteer').insert(volunteers);
    if (volunteersError) throw volunteersError;
    
    // Add sample events
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const events = [
      {
        title: 'Community Cleanup',
        description: 'A community initiative to clean and beautify our local park areas.',
        start_date: today.toISOString(),
        end_date: today.toISOString(),
        location: 'Central Park, Bangalore',
        organizer_id: '1', // Assuming the first admin has id 1
        status: 'Active',
        max_volunteers: 20,
        image_url: 'https://example.com/images/community-cleanup.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        title: 'Charity Fundraiser',
        description: 'An evening of entertainment and auctions to raise funds for children\'s education.',
        start_date: nextMonth.toISOString(),
        end_date: nextMonth.toISOString(),
        location: 'City Hall, Mumbai',
        organizer_id: '1',
        status: 'Upcoming',
        max_volunteers: 35,
        image_url: 'https://example.com/images/charity-fundraiser.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    const { error: eventsError } = await supabase.from('event').insert(events);
    if (eventsError) throw eventsError;
    
    return { success: true, message: 'Sample data added successfully', error: null };
  } catch (error) {
    console.error('Error adding sample data:', error);
    return { success: false, message: 'Failed to add sample data', error };
  }
};

// Add volunteer event signup functions
export const getVolunteerEventSignups = async (volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('event_signup')
      .select(`
        id,
        event_id,
        volunteer_id,
        signup_date,
        attended,
        hours,
        feedback,
        rating,
        event:event_id(*)
      `)
      .eq('volunteer_id', volunteerId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching event signups for volunteer ${volunteerId}:`, error);
    return { data: [], error };
  }
};

export const signupVolunteerForEvent = async (eventId: string, volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('event_signup')
      .insert([{
        event_id: eventId,
        volunteer_id: volunteerId,
        signup_date: new Date().toISOString(),
        attended: false,
        hours: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error signing up volunteer ${volunteerId} for event ${eventId}:`, error);
    return { data: null, error };
  }
};

export const updateVolunteerAttendance = async (signupId: string, attended: boolean, hours: number = 0) => {
  try {
    const { data, error } = await supabase
      .from('event_signup')
      .update({
        attended,
        hours,
        ...(attended ? { last_active: new Date().toISOString() } : {})
      })
      .eq('id', signupId)
      .select()
      .single();
    
    if (error) throw error;
    
    // If the volunteer attended, also update their last_active status
    if (attended && data?.volunteer_id) {
      await supabase
        .from('volunteer')
        .update({ last_active: new Date().toISOString() })
        .eq('id', data.volunteer_id);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating attendance for signup ${signupId}:`, error);
    return { data: null, error };
  }
};

export const getVolunteerStats = async (volunteerId: string) => {
  try {
    // Get total hours served
    const { data: signups, error: signupsError } = await supabase
      .from('event_signup')
      .select('hours, event_id')
      .eq('volunteer_id', volunteerId)
      .eq('attended', true);
    
    if (signupsError) throw signupsError;
    
    // Calculate stats
    const totalHours = signups ? signups.reduce((sum, signup) => sum + (parseFloat(signup.hours) || 0), 0) : 0;
    const totalEvents = signups ? new Set(signups.map(signup => signup.event_id)).size : 0;
    
    // Get badges if they exist
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteer')
      .select('badges, rating')
      .eq('id', volunteerId)
      .single();
    
    if (volunteerError) throw volunteerError;
    
    return {
      data: {
        totalHours,
        totalEvents,
        badges: volunteer?.badges || [],
        rating: volunteer?.rating || 0,
      },
      error: null
    };
  } catch (error) {
    console.error(`Error fetching stats for volunteer ${volunteerId}:`, error);
    return { 
      data: { totalHours: 0, totalEvents: 0, badges: [], rating: 0 },
      error 
    };
  }
};

// Get volunteer details with all related data for the detailed view
export const getVolunteerDetails = async (volunteerId: string) => {
  try {
    // Get volunteer data
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteer')
      .select('*')
      .eq('id', volunteerId)
      .single();
    
    if (volunteerError) throw volunteerError;
    
    if (!volunteer) {
      return { data: null, error: new Error('Volunteer not found') };
    }
    
    // Get event signups
    const { data: signups, error: signupsError } = await supabase
      .from('event_signup')
      .select(`
        id,
        event_id,
        signup_date,
        attended,
        hours,
        feedback,
        rating,
        event:event_id(
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          status,
          category,
          image_url
        )
      `)
      .eq('volunteer_id', volunteerId)
      .order('signup_date', { ascending: false });
    
    if (signupsError) throw signupsError;
    
    // Calculate stats
    const hoursAttended = signups
      ? signups.filter(s => s.attended).reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0)
      : 0;
    
    const eventsAttended = signups 
      ? new Set(signups.filter(s => s.attended).map(s => s.event_id)).size
      : 0;
      
    const upcomingEvents = signups
      ? signups.filter(s => {
          const event = s.event;
          return !s.attended && event && new Date(event?.start_date || '') > new Date();
        })
      : [];
      
    const pastEvents = signups
      ? signups.filter(s => s.attended || (s.event && new Date(s.event?.end_date || '') < new Date()))
      : [];
    
    // Combine all data
    const enrichedVolunteer = {
      ...volunteer,
      stats: {
        totalHours: hoursAttended,
        eventsAttended,
        signupCount: signups ? signups.length : 0,
      },
      upcomingEvents,
      pastEvents,
    };
    
    return { data: enrichedVolunteer, error: null };
  } catch (error) {
    console.error(`Error fetching details for volunteer ${volunteerId}:`, error);
    return { data: null, error };
  }
};

// Update a volunteer's status
export const updateVolunteerStatus = async (volunteerId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', volunteerId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating status for volunteer ${volunteerId}:`, error);
    return { data: null, error };
  }
};

// Add or update a badge for a volunteer
export const updateVolunteerBadges = async (volunteerId: string, badges: string[]) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .update({ 
        badges,
        updated_at: new Date().toISOString() 
      })
      .eq('id', volunteerId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating badges for volunteer ${volunteerId}:`, error);
    return { data: null, error };
  }
};

// Filter volunteers by various criteria
export const filterVolunteers = async (filters: {
  skills?: string[],
  interests?: string[],
  city?: string,
  status?: string,
  availability?: string,
  searchTerm?: string
}) => {
  try {
    let query = supabase
      .from('volunteer')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters.skills && filters.skills.length > 0) {
      // Filter for volunteers who have any of the specified skills
      query = query.contains('skills', filters.skills);
    }
    
    if (filters.interests && filters.interests.length > 0) {
      // Filter for volunteers who have any of the specified interests
      query = query.contains('interests', filters.interests);
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.availability) {
      query = query.ilike('availability', `%${filters.availability}%`);
    }
    
    if (filters.searchTerm) {
      query = query.or(
        `first_name.ilike.%${filters.searchTerm}%,` +
        `last_name.ilike.%${filters.searchTerm}%,` +
        `email.ilike.%${filters.searchTerm}%,` +
        `city.ilike.%${filters.searchTerm}%`
      );
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // After getting filtered volunteers, enrich with event stats
    if (data && data.length > 0) {
      // Use the same enrichment logic from getVolunteers
      const volunteerIds = data.map(v => v.id);
      
      const { data: signups } = await supabase
        .from('event_signup')
        .select('volunteer_id, event_id, hours, attended')
        .in('volunteer_id', volunteerIds);
      
      const volunteerStats = {};
      
      // Initialize stats
      data.forEach(v => {
        volunteerStats[v.id] = {
          totalEvents: 0,
          totalHours: 0,
          eventsAttended: []
        };
      });
      
      // Calculate stats
      if (signups && signups.length > 0) {
        signups.forEach(signup => {
          const volunteerId = signup.volunteer_id;
          
          if (signup.attended) {
            volunteerStats[volunteerId].eventsAttended.push(signup.event_id);
            volunteerStats[volunteerId].totalHours += parseFloat(signup.hours) || 0;
          }
        });
        
        Object.keys(volunteerStats).forEach(id => {
          volunteerStats[id].totalEvents = new Set(volunteerStats[id].eventsAttended).size;
        });
      }
      
      // Enrich volunteer data
      const enrichedVolunteers = data.map(volunteer => ({
        ...volunteer,
        events: volunteerStats[volunteer.id].totalEvents,
        hours: volunteerStats[volunteer.id].totalHours,
        status: volunteer.status || 'Active',
        rating: volunteer.rating || 5.0,
      }));
      
      return { data: enrichedVolunteers, error: null };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error filtering volunteers:', error);
    return { data: [], error };
  }
};

// Add rating to a volunteer
export const updateVolunteerRating = async (volunteerId: string, rating: number) => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .update({ 
        rating,
        updated_at: new Date().toISOString() 
      })
      .eq('id', volunteerId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating rating for volunteer ${volunteerId}:`, error);
    return { data: null, error };
  }
}; 
