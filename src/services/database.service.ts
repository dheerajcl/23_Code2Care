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
    
    // Initialize defaults for each volunteer
    const enrichedVolunteers = volunteers.map(volunteer => ({
      ...volunteer,
      events: 0,  // Default to 0 events
      hours: 0,   // Default to 0 hours
      status: volunteer.status || 'Active',
      rating: volunteer.rating || 5.0,
    }));
    
    try {
      // Get event signups if the table exists
      const volunteerIds = volunteers.map(v => v.id);
      
      // Use event_signup table consistently
      const { data: signups, error: signupsError } = await supabase
        .from('event_signup')
        .select('volunteer_id, event_id, hours')
        .in('volunteer_id', volunteerIds);
      
      if (!signupsError && signups && signups.length > 0) {
        console.log('Using event_signup table data');
        
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
        signups.forEach(signup => {
          const volunteerId = signup.volunteer_id;
          volunteerStats[volunteerId].eventsAttended.push(signup.event_id);
          volunteerStats[volunteerId].totalHours += parseFloat(signup.hours) || 0;
        });
        
        // Calculate unique events attended
        Object.keys(volunteerStats).forEach(id => {
          volunteerStats[id].totalEvents = new Set(volunteerStats[id].eventsAttended).size;
        });
        
        // Update enriched volunteers with stats
        enrichedVolunteers.forEach(volunteer => {
          if (volunteerStats[volunteer.id]) {
            volunteer.events = volunteerStats[volunteer.id].totalEvents;
            volunteer.hours = volunteerStats[volunteer.id].totalHours;
          }
        });
      }
    } catch (statsError) {
      console.warn('Error fetching volunteer stats, continuing with default values:', statsError);
      // Continue with default values
    }
    
    return { data: enrichedVolunteers, error: null };
  } catch (error) {
    console.error('Error fetching volunteers:', error);
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
      .from('event_signup')
      .select(`
        id,
        event_id,
        volunteer_id,
        created_at as registration_date,
        status,
        hours,
        feedback,
        volunteer:volunteer_id(*)
      `)
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error with initial query, trying fallback:', error);
      
      // Fallback: Fetch registrations and volunteers separately
      const { data: registrations, error: regError } = await supabase
        .from('event_signup')
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
      .from('event_signup')
      .insert([{
        event_id: eventId,
        volunteer_id: volunteerId,
        status: 'registered',
        ...registrationData,
        created_at: new Date().toISOString(),
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
      .from('event_signup')
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
      .from('event_signup')
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
    
    // Initialize with empty data in case table doesn't exist
    let signups = [];
    let hoursAttended = 0;
    let eventsAttended = 0;
    let upcomingEvents = [];
    let pastEvents = [];
    
    try {
      // Get event signups
      const { data: registrations, error: signupsError } = await supabase
        .from('event_signup')
        .select(`
          id,
          event_id,
          created_at,
          attended,
          hours,
          feedback,
          status,
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
        .order('created_at', { ascending: false });
        
      if (!signupsError && registrations && registrations.length > 0) {
        console.log('Using event_signup table for volunteer details');
        
        // Use the data directly
        signups = registrations;
        
        // Calculate stats
        hoursAttended = signups
          .filter(s => s.attended)
          .reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
          
        eventsAttended = new Set(
          signups
            .filter(s => s.attended)
            .map(s => s.event_id)
        ).size;
          
        upcomingEvents = signups.filter(s => {
          const event = s.event;
          return event && 
            !s.attended && 
            new Date(event.start_date || Date.now()) > new Date();
        });
          
        pastEvents = signups.filter(s => {
          const event = s.event;
          return s.attended || 
            (event && new Date(event.end_date || 0) < new Date());
        });
      }
    } catch (error) {
      console.warn('Error fetching event signups:', error);
      // Continue with empty data
    }
    
    // Combine all data
    const enrichedVolunteer = {
      ...volunteer,
      stats: {
        totalHours: hoursAttended,
        eventsAttended,
        signupCount: signups.length,
      },
      upcomingEvents,
      pastEvents,
    };
    
    return { data: enrichedVolunteer, error: null };
  } catch (error) {
    console.error(`Error fetching volunteer details:`, error);
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

// Report functions for Admin Dashboard

export interface EventParticipation {
  id: string;
  title: string;
  participant_count: number;
}

export interface FrequentVolunteer {
  id: string;
  volunteer_name: string; 
  event_count: number;
}

export interface EventTaskCompletion {
  id: string;
  event_name: string;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
}

export interface VolunteerEngagement {
  volunteer_name: string;
  event_frequency: number;
  event_variety: number;
  timely_completion_percentage: number | null;
  engagement_score: number;
}

export interface LocationAnalytics {
  location: string;
  volunteer_count: number;
  event_count: number;
}

export interface SkillAnalysis {
  skill: string;
  available: number;
  demand: number;
}

export interface ReportData {
  topEvents: EventParticipation[];
  frequentVolunteers: FrequentVolunteer[];
  eventTasks: EventTaskCompletion[];
  retentionRate: number;
  volunteerEngagement: VolunteerEngagement[];
  locationData: LocationAnalytics[];
  skillData: SkillAnalysis[];
}

// Get all report data in a single function
export const getReportData = async (): Promise<{ data: ReportData | null, error: any }> => {
  try {
    const [
      topEventsResult,
      frequentVolunteersResult,
      eventTasksResult,
      retentionRateResult,
      volunteerEngagementResult,
      locationDataResult,
      skillDataResult
    ] = await Promise.all([
      getTopEventsByParticipation(),
      getFrequentVolunteers(),
      getEventTaskCompletion(),
      getVolunteerRetentionRate(),
      getVolunteerEngagement(),
      getLocationAnalytics(),
      getSkillAnalysis()
    ]);

    if (
      topEventsResult.error || 
      frequentVolunteersResult.error || 
      eventTasksResult.error || 
      retentionRateResult.error ||
      volunteerEngagementResult.error ||
      locationDataResult.error ||
      skillDataResult.error
    ) {
      throw new Error('Failed to fetch one or more report components');
    }

    const reportData: ReportData = {
      topEvents: topEventsResult.data || [],
      frequentVolunteers: frequentVolunteersResult.data || [],
      eventTasks: eventTasksResult.data || [],
      retentionRate: retentionRateResult.data || 0,
      volunteerEngagement: volunteerEngagementResult.data || [],
      locationData: locationDataResult.data || [],
      skillData: skillDataResult.data || []
    };

    return { data: reportData, error: null };
  } catch (error) {
    console.error('Error fetching report data:', error);
    return { data: null, error };
  }
};

// 1. Top Events by Participation
export const getTopEventsByParticipation = async (): Promise<{ data: EventParticipation[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('event')
      .select(`
        id,
        title,
        event_signup!inner (volunteer_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process the data to count participants per event
    const eventsWithCounts = data.map(event => ({
      id: event.id,
      title: event.title,
      participant_count: event.event_signup ? event.event_signup.length : 0
    }));

    // Sort by participant count
    eventsWithCounts.sort((a, b) => b.participant_count - a.participant_count);
    
    return { data: eventsWithCounts.slice(0, 10), error: null };
  } catch (error) {
    console.error('Error fetching top events by participation:', error);
    return { data: null, error };
  }
};

// 2. Most Frequent Volunteers
export const getFrequentVolunteers = async (): Promise<{ data: FrequentVolunteer[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .select(`
        id,
        first_name,
        last_name,
        event_signup (event_id)
      `);

    if (error) throw error;

    // Process the data to count events per volunteer
    const volunteersWithCounts = data.map(volunteer => ({
      id: volunteer.id,
      volunteer_name: `${volunteer.first_name} ${volunteer.last_name}`,
      event_count: volunteer.event_signup ? volunteer.event_signup.length : 0
    }));

    // Sort by event count
    volunteersWithCounts.sort((a, b) => b.event_count - a.event_count);
    
    return { data: volunteersWithCounts.slice(0, 10), error: null };
  } catch (error) {
    console.error('Error fetching frequent volunteers:', error);
    return { data: null, error };
  }
};

// 3. Event Task Completion Report
export const getEventTaskCompletion = async (): Promise<{ data: EventTaskCompletion[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('event')
      .select(`
        id,
        title,
        task (status)
      `);

    if (error) throw error;

    // Process the data to count task statuses per event
    const eventTaskCompletion = data.map(event => {
      const tasks = event.task || [];
      return {
        id: event.id,
        event_name: event.title,
        completed_tasks: tasks.filter(t => t.status === 'Completed').length,
        pending_tasks: tasks.filter(t => t.status === 'Todo' || t.status === 'In Progress').length,
        overdue_tasks: tasks.filter(t => t.status === 'Overdue').length
      };
    });
    
    return { data: eventTaskCompletion, error: null };
  } catch (error) {
    console.error('Error fetching event task completion:', error);
    return { data: null, error };
  }
};

// 4. Volunteer Retention Rate
export const getVolunteerRetentionRate = async (): Promise<{ data: number | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('volunteer')
      .select(`
        id,
        event_signup (event_id)
      `);

    if (error) throw error;

    // Calculate volunteers who participated in more than one event
    const totalVolunteers = data.length;
    const repeatedVolunteers = data.filter(v => 
      v.event_signup && v.event_signup.length > 1
    ).length;
    
    const retentionRate = totalVolunteers > 0 
      ? Math.round((repeatedVolunteers / totalVolunteers) * 100) 
      : 0;
    
    return { data: retentionRate, error: null };
  } catch (error) {
    console.error('Error calculating volunteer retention rate:', error);
    return { data: null, error };
  }
};

// 5. Volunteer Engagement Score
export const getVolunteerEngagement = async (): Promise<{ data: VolunteerEngagement[] | null, error: any }> => {
  try {
    const { data: volunteers, error: volunteerError } = await supabase
      .from('volunteer')
      .select(`
        id,
        first_name,
        last_name,
        event_signup (
          event_id,
          event:event_id (title)
        )
      `);

    if (volunteerError) throw volunteerError;

    // Get task data for each volunteer
    const { data: tasks, error: taskError } = await supabase
      .from('task')
      .select('*')
      .eq('assignee_type', 'volunteer');

    if (taskError) throw taskError;

    // Calculate engagement metrics
    const volunteerEngagement = volunteers.map(volunteer => {
      const eventSignups = volunteer.event_signup || [];
      const eventCount = eventSignups.length;
      
      // Calculate unique event types (by title)
      const eventTitles = new Set();
      eventSignups.forEach(signup => {
        if (signup.event && signup.event.title) {
          eventTitles.add(signup.event.title);
        }
      });
      const eventVariety = eventTitles.size;
      
      // Calculate task completion rate
      const volunteerTasks = tasks.filter(t => t.assignee_id === volunteer.id);
      const totalTasks = volunteerTasks.length;
      const completedTasks = volunteerTasks.filter(t => t.status === 'Completed').length;
      const timelyCompletionPercentage = totalTasks > 0 
        ? (completedTasks / totalTasks) * 100 
        : null;
      
      // Calculate engagement score based on our formula
      const frequencyScore = Math.min(eventCount * 3, 30); // Max 30 points
      const varietyScore = Math.min(eventVariety * 10, 20); // Max 20 points
      const completionScore = timelyCompletionPercentage 
        ? (timelyCompletionPercentage / 100) * 25 
        : 0; // Max 25 points
      // Leaving out feedback score since we don't have ratings
      
      const engagementScore = Math.round(frequencyScore + varietyScore + completionScore);
      
      return {
        volunteer_name: `${volunteer.first_name} ${volunteer.last_name}`,
        event_frequency: eventCount,
        event_variety: eventVariety,
        timely_completion_percentage: timelyCompletionPercentage,
        engagement_score: engagementScore
      };
    });
    
    // Sort by engagement score
    volunteerEngagement.sort((a, b) => b.engagement_score - a.engagement_score);
    
    return { data: volunteerEngagement.slice(0, 10), error: null };
  } catch (error) {
    console.error('Error calculating volunteer engagement scores:', error);
    return { data: null, error };
  }
};

// 6. Location-based analytics
export const getLocationAnalytics = async (): Promise<{ data: LocationAnalytics[] | null, error: any }> => {
  try {
    // Get all volunteers with their locations
    const { data: volunteers, error: volunteerError } = await supabase
      .from('volunteer')
      .select('id, city');

    if (volunteerError) throw volunteerError;

    // Get all events with their locations
    const { data: events, error: eventError } = await supabase
      .from('event')
      .select('id, location');

    if (eventError) throw eventError;

    // Group volunteers by city
    const locationMap = new Map<string, {volunteers: string[], events: string[]}>();
    
    // Count volunteers per city
    volunteers.forEach(volunteer => {
      if (volunteer.city) {
        if (!locationMap.has(volunteer.city)) {
          locationMap.set(volunteer.city, {volunteers: [], events: []});
        }
        locationMap.get(volunteer.city)?.volunteers.push(volunteer.id);
      }
    });
    
    // Count events per city (simplified approach)
    events.forEach(event => {
      // For each location in our map, check if the event location includes that city name
      locationMap.forEach((value, city) => {
        if (event.location && event.location.toLowerCase().includes(city.toLowerCase())) {
          value.events.push(event.id);
        }
      });
    });
    
    // Convert map to array and format
    const locationData = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        volunteer_count: new Set(data.volunteers).size,
        event_count: new Set(data.events).size
      }))
      .sort((a, b) => b.volunteer_count - a.volunteer_count);
    
    return { data: locationData, error: null };
  } catch (error) {
    console.error('Error fetching location analytics:', error);
    return { data: null, error };
  }
};

// 7. Skill Gap Analysis
export const getSkillAnalysis = async (): Promise<{ data: SkillAnalysis[] | null, error: any }> => {
  try {
    // Get volunteers with their skills
    const { data: volunteers, error } = await supabase
      .from('volunteer')
      .select('skills');

    if (error) throw error;

    // Count occurrences of each skill
    const skillCounts = new Map<string, number>();
    
    volunteers.forEach(volunteer => {
      if (volunteer.skills && Array.isArray(volunteer.skills)) {
        volunteer.skills.forEach(skill => {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
        });
      }
    });
    
    // Convert to array format
    const skillData = Array.from(skillCounts.entries())
      .map(([skill, available]) => ({
        skill,
        available,
        demand: 0 // Placeholder since we don't have demand data
      }))
      .sort((a, b) => b.available - a.available);
    
    return { data: skillData, error: null };
  } catch (error) {
    console.error('Error analyzing skills gap:', error);
    return { data: null, error };
  }
}; 