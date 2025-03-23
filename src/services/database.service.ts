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
    
    // First check if the volunteer is already registered
    const { isRegistered, error: checkError } = await checkEventRegistration(eventId, volunteerId);
    
    if (checkError) throw checkError;
    
    if (isRegistered) {
      return { 
        success: false, 
        error: new Error('Volunteer is already registered for this event') 
      };
    }
    
    // Now register the volunteer
    const { data, error } = await supabase
      .from('event_signup')
      .insert([{
        event_id: eventId,
        volunteer_id: volunteerId,
        created_at: new Date().toISOString(),
        status: 'registered',
        attended: false,
        hours: 0,
        ...registrationData
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Check if this is their first event and award badge if it is
    await checkAndAwardFirstEventBadge(volunteerId);
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error(`Error registering volunteer ${volunteerId} for event ${eventId}:`, error);
    return { success: false, error };
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

export const deleteTask = async (taskId: string) => {
  try {
    // Ensure user is authenticated first
    await ensureAuthenticated();
    
    // First delete any task assignments
    try {
      const { error: assignmentDeleteError } = await supabase
        .from('task_assignment')
        .delete()
        .eq('task_id', taskId);
      
      if (assignmentDeleteError) {
        console.log('Error deleting task assignments, continuing:', assignmentDeleteError);
      }
    } catch (error) {
      console.log('Error with task assignment deletion, continuing:', error);
    }
    
    // Delete any task feedback
    try {
      const { error: feedbackDeleteError } = await supabase
        .from('task_feedback')
        .delete()
        .eq('task_id', taskId);
      
      if (feedbackDeleteError && feedbackDeleteError.code !== 'PGRST116') {
        console.log('Error deleting task feedback, continuing:', feedbackDeleteError);
      }
    } catch (error) {
      console.log('Error with task feedback deletion, continuing:', error);
    }
    
    // Now delete the task itself
    const { error } = await supabase
      .from('task')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting task with id ${taskId}:`, error);
    return { success: false, error };
  }
};

// Get task by ID with related event info
export const getTaskById = async (taskId: string) => {
  try {
    const { data: task, error: taskError } = await supabase
      .from('task')
      .select('*, event:event_id(*)')
      .eq('id', taskId)
      .single();
    
    if (taskError) throw taskError;
    
    return { data: task, error: null };
  } catch (error) {
    console.error(`Error fetching task with id ${taskId}:`, error);
    return { data: null, error };
  }
};

// Get tasks assigned to a volunteer
export const getTasksForVolunteer = async (volunteerId: string) => {
  try {
    // First try to get task assignments
    const { data: assignments, error: assignmentError } = await supabase
      .from('task_assignment')
      .select('task_id, status')
      .eq('volunteer_id', volunteerId);
    
    if (assignmentError) throw assignmentError;
    
    if (!assignments || assignments.length === 0) {
      return { data: [], error: null };
    }
    
    // Get task details for each assignment
    const taskIds = assignments.map(a => a.task_id);
    const { data: tasks, error: taskError } = await supabase
      .from('task')
      .select('*, event:event_id(title, start_date, end_date, image_url)')
      .in('id', taskIds);
    
    if (taskError) throw taskError;
    
    // Merge task data with assignment status
    const enrichedTasks = tasks.map(task => {
      const assignment = assignments.find(a => a.task_id === task.id);
      return {
        ...task,
        assignment_status: assignment ? assignment.status : 'assigned'
      };
    });
    
    return { data: enrichedTasks, error: null };
  } catch (error) {
    console.error(`Error fetching tasks for volunteer ${volunteerId}:`, error);
    return { data: [], error };
  }
};

// Submit task feedback from volunteer
export const submitTaskFeedback = async (taskId: string, volunteerId: string, feedbackData: any) => {
  try {
    // First verify the task exists and is assigned to this volunteer
    const { data: assignment, error: assignmentError } = await supabase
      .from('task_assignment')
      .select('id')
      .eq('task_id', taskId)
      .eq('volunteer_id', volunteerId)
      .single();
    
    if (assignmentError) {
      return { success: false, error: new Error('Task not found or not assigned to this volunteer') };
    }
    
    // Now insert the feedback
    const { data, error } = await supabase
      .from('task_feedback')
      .insert({
        task_id: taskId,
        volunteer_id: volunteerId,
        feedback: feedbackData.feedback,
        rating: feedbackData.rating,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the task assignment status
    await supabase
      .from('task_assignment')
      .update({ status: 'completed' })
      .eq('task_id', taskId)
      .eq('volunteer_id', volunteerId);
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error(`Error submitting feedback for task ${taskId}:`, error);
    return { success: false, error };
  }
};

// Cancel a volunteer's registration for an event
export const cancelEventRegistration = async (eventId: string, volunteerId: string) => {
  try {
    // Ensure the event hasn't started yet (can't cancel registration for events that already began)
    const { data: eventData, error: eventError } = await supabase
      .from('event')
      .select('start_date')
      .eq('id', eventId)
      .single();
    
    if (eventError) throw eventError;
    
    const startDate = new Date(eventData.start_date);
    if (startDate < new Date()) {
      return { data: null, error: new Error('Cannot cancel registration for an event that has already started') };
    }
    
    // Find and delete the signup
    const { data, error } = await supabase
      .from('event_signup')
      .delete()
      .eq('event_id', eventId)
      .eq('volunteer_id', volunteerId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error canceling event registration:', error);
    return { data: null, error };
  }
};

// Check if a volunteer is registered for an event
export const checkEventRegistration = async (eventId: string, volunteerId: string) => {
  try {
    const { data, error } = await supabase
      .from('event_signup')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('volunteer_id', volunteerId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Not found - not registered
      return { 
        isRegistered: false, 
        data: null, 
        error: null 
      };
    }
    
    if (error) throw error;
    
    return { 
      isRegistered: true, 
      registrationStatus: data?.status || 'registered',
      data, 
      error: null 
    };
  } catch (error) {
    console.error(`Error checking registration for event ${eventId} and volunteer ${volunteerId}:`, error);
    return { isRegistered: false, data: null, error };
  }
};

// Helper function to check and award the first event badge
const checkAndAwardFirstEventBadge = async (volunteerId: string) => {
  try {
    // Count the number of events this volunteer has signed up for
    const { count, error } = await supabase
      .from('event_signup')
      .select('*', { count: 'exact', head: true })
      .eq('volunteer_id', volunteerId);
    
    if (error) throw error;
    
    // If this is their first event, award the badge
    if (count === 1) {
      // Get current badges
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteer')
        .select('badges')
        .eq('id', volunteerId)
        .single();
      
      if (volunteerError) throw volunteerError;
      
      // Add the first_event badge if not already present
      const currentBadges = volunteerData.badges || [];
      if (!currentBadges.includes('first_event')) {
        const newBadges = [...currentBadges, 'first_event'];
        
        // Update the volunteer record
        await supabase
          .from('volunteer')
          .update({ badges: newBadges })
          .eq('id', volunteerId);
      }
    }
  } catch (error) {
    console.error('Error checking/awarding first event badge:', error);
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

// Get volunteer leaderboard
export const getVolunteerLeaderboard = async () => {
  try {
    // Use a simple query that doesn't rely on the status column
    const { data, error } = await supabase
      .from('volunteer')
      .select(`
        id,
        first_name,
        last_name,
        profile_image,
        badges,
        event_signup:event_signup (
          id,
          event_id,
          attended,
          hours
        )
      `)
      .eq('status', 'Active');
    
    if (error) throw error;
    
    // Process the data in JavaScript instead of relying on the stored function
    const leaderboardData = data.map(vol => {
      const eventSignups = vol.event_signup || [];
      const attendedEvents = eventSignups.filter(signup => signup.attended);
      const totalHours = attendedEvents.reduce((sum, signup) => sum + (signup.hours || 0), 0);
      const eventsAttended = attendedEvents.length;
      const badgeCount = vol.badges ? vol.badges.length : 0;
      
      // Calculate points
      const points = eventsAttended * 20 + badgeCount * 50;
      
      return {
        id: vol.id,
        first_name: vol.first_name,
        last_name: vol.last_name,
        profile_image: vol.profile_image,
        total_hours: totalHours,
        events_attended: eventsAttended,
        badges: vol.badges,
        points,
        score: 0 // Will be calculated after sorting
      };
    });
    
    // Sort by points (descending)
    leaderboardData.sort((a, b) => b.points - a.points);
    
    // Add rank and calculate score
    const maxPoints = leaderboardData.length > 0 ? leaderboardData[0].points : 0;
    
    const rankedData = leaderboardData.map((vol, index) => {
      return {
        ...vol,
        rank: index + 1,
        score: maxPoints > 0 ? Math.round((vol.points / maxPoints) * 100) : 0
      };
    });
    
    return { data: rankedData, error: null };
  } catch (error) {
    console.error('Error fetching volunteer leaderboard:', error);
    return { data: [], error };
  }
};

// Get volunteer rank
export const getVolunteerRank = async (volunteerId: string) => {
  try {
    const { data: leaderboardData, error: leaderboardError } = await getVolunteerLeaderboard();
    
    if (leaderboardError) throw leaderboardError;
    
    const volunteerRank = leaderboardData.find(vol => vol.id === volunteerId);
    
    return { 
      data: volunteerRank || {
        id: volunteerId,
        rank: 0,
        first_name: '',
        last_name: '',
        profile_image: null,
        total_hours: 0,
        events_attended: 0,
        badges: [],
        points: 0,
        score: 0
      }, 
      error: null 
    };
  } catch (error) {
    console.error(`Error fetching rank for volunteer ${volunteerId}:`, error);
    return { 
      data: {
        id: volunteerId,
        rank: 0,
        first_name: '',
        last_name: '',
        profile_image: null,
        total_hours: 0,
        events_attended: 0,
        badges: [],
        points: 0,
        score: 0
      }, 
      error 
    };
  }
};

// Create a task assignment with notification
export const createTaskAssignment = async (taskId: string, volunteerId: string, eventId: string) => {
  try {
    const now = new Date().toISOString();
    
    // Create the task assignment
    const { data, error } = await supabase
      .from('task_assignment')
      .insert({
        task_id: taskId,
        volunteer_id: volunteerId,
        event_id: eventId,
        created_at: now,
        backlog: 0,
        todo: 1, // Mark as todo initially
        in_progress: 0,
        in_review: 0,
        done: 0,
        assigned: 1, // Mark as assigned
        notification_status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Import and use the notification service
    // Note: Using import here to avoid circular dependencies
    const { notificationService } = await import('./notification.service');
    
    // Send notification to the volunteer
    await notificationService.notifyTaskAssignment(
      data.id,
      volunteerId,
      taskId,
      eventId
    );
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating task assignment with notification:', error);
    return { data: null, error };
  }
};

// Get task assignments with volunteer details
export const getTaskAssignmentsWithDetails = async (filters = {}) => {
  try {
    let query = supabase
      .from('task_assignment')
      .select(`
        *,
        task:task_id (
          *
        ),
        volunteer:volunteer_id (
          id,
          first_name,
          last_name,
          email,
          profile_image
        ),
        event:event_id (
          id,
          title
        )
      `);
    
    // Apply filters if provided
    if (filters.taskId) {
      query = query.eq('task_id', filters.taskId);
    }
    
    if (filters.volunteerId) {
      query = query.eq('volunteer_id', filters.volunteerId);
    }
    
    if (filters.eventId) {
      query = query.eq('event_id', filters.eventId);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.notificationStatus) {
      query = query.eq('notification_status', filters.notificationStatus);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching task assignments with details:', error);
    return { data: [], error };
  }
}; 