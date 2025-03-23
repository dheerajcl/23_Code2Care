import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { pointsService } from './points.service';

// Define better types for users
export type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'volunteer';
  [key: string]: unknown;
};

// Define the CurrentUser type
export type CurrentUser = UserData;

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const volunteerRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  availability: z.string().optional(),
  experience: z.string().optional(),
  howHeard: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const adminRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Authentication types
type AuthResponse = {
  success: boolean;
  message: string;
  user?: UserData;
};

// Error type
type AppError = {
  message: string;
  [key: string]: unknown;
};

// Admin authentication
export const registerAdmin = async (userData: z.infer<typeof adminRegisterSchema>): Promise<AuthResponse> => {
  try {
    // Validate input
    const result = adminRegisterSchema.safeParse(userData);
    if (!result.success) {
      return { success: false, message: 'Invalid user data' };
    }

    // Check if an admin account with this email already exists in the database
    const { data: existingAdmin } = await supabase
      .from('admin')
      .select('*')
      .eq('email', userData.email)
      .single();

    // If admin already exists, we can try to log in directly
    if (existingAdmin) {
      // Try to sign in
      const signInResult = await loginAdmin({
        email: userData.email,
        password: userData.password
      });

      if (signInResult.success) {
        return {
          success: true,
          message: 'Admin account already exists, logged in successfully',
          user: signInResult.user
        };
      } else {
        return { success: false, message: 'An account with this email already exists.' };
      }
    }

    // Create account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: 'admin' // Add role metadata
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'Failed to create user' };
    }
    
    const userId = data.user.id;

    // Insert admin record directly regardless of email confirmation
    const { error: insertError, data: insertData } = await supabase
      .from('admin')
      .insert({
        id: userId,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      })
      .select();

    if (insertError) {
      return { success: false, message: insertError.message || 'Failed to create admin record' };
    }

    if (!insertData?.[0]) {
      return { success: false, message: 'Failed to create admin record' };
    }

    // Here's the key: We ignore email confirmation completely and attempt to sign in immediately
    return {
      success: true,
      message: 'Admin registered successfully. Please sign in.',
      user: {
        ...insertData[0],
        firstName: insertData[0].first_name,
        lastName: insertData[0].last_name,
        role: 'admin' as const,
      },
    };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to register admin' };
  }
};

export const loginAdmin = async (credentials: z.infer<typeof loginSchema>): Promise<AuthResponse> => {
  try {
    console.log('Starting admin login process...');
    
    // Test database connection first with a simple query
    const { data: testData, error: testError } = await supabase
      .from('admin')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Database connection test failed:', testError);
      return { 
        success: false, 
        message: 'Cannot connect to database. Please try again later.' 
      };
    }
    
    console.log('Database connection successful, checking admin credentials...');
    
    // Verify if this admin exists in our database
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', credentials.email)
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Database error while fetching admin:', adminError);
      return { 
        success: false, 
        message: 'Error verifying account. Please try again.' 
      };
    }
    
    if (!adminData) {
      console.log('No admin found with this email');
      return { 
        success: false, 
        message: 'No admin account found with this email' 
      };
    }
    
    // Simple password check against the stored password
    if (adminData.password !== credentials.password) {
      console.log('Password does not match');
      return { 
        success: false, 
        message: 'Invalid email or password' 
      };
    }
    
    // Create user object
    const user = {
      id: adminData.id,
      email: adminData.email,
      firstName: adminData.first_name,
      lastName: adminData.last_name,
      role: 'admin' as const,
    };
    
    console.log('Login successful');
    return {
      success: true,
      message: 'Login successful',
      user: user,
    };
  } catch (error: unknown) {
    console.error('Unexpected error during login:', error);
    const err = error as AppError;
    return { 
      success: false, 
      message: 'Login failed. Please check your connection and try again.' 
    };
  }
};

// Volunteer authentication
export const registerVolunteer = async (userData: z.infer<typeof volunteerRegisterSchema>): Promise<AuthResponse> => {
  try {
    // Validate input
    const result = volunteerRegisterSchema.safeParse(userData);
    if (!result.success) {
      return { success: false, message: 'Invalid user data' };
    }

    // Check if a volunteer account with this email already exists in the database
    const { data: existingVolunteer } = await supabase
      .from('volunteer')
      .select('*')
      .eq('email', userData.email)
      .single();

    // If volunteer already exists, we can try to log in directly
    if (existingVolunteer) {
      // Try to sign in
      const signInResult = await loginVolunteer({
        email: userData.email,
        password: userData.password
      });

      if (signInResult.success) {
        return {
          success: true,
          message: 'Volunteer account already exists, logged in successfully',
          user: signInResult.user
        };
      } else {
        return { success: false, message: 'An account with this email already exists.' };
      }
    }

    // Create account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: 'volunteer' // Add role metadata
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'Failed to create user' };
    }

    const userId = data.user.id;
    
    // Create volunteer in database
    const { error: insertError, data: insertData } = await supabase
      .from('volunteer')
      .insert({
        id: userId,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName, 
        last_name: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        skills: userData.skills || [],
        interests: userData.interests || [],
        availability: userData.availability,
        experience: userData.experience,
        how_heard: userData.howHeard
      })
      .select();

    if (insertError) {
      return { success: false, message: insertError.message || 'Failed to create volunteer record' };
    }

    if (!insertData?.[0]) {
      return { success: false, message: 'Failed to create volunteer record' };
    }

    return {
      success: true,
      message: 'Volunteer registered successfully. Please sign in.',
      user: {
        ...insertData[0],
        firstName: insertData[0].first_name,
        lastName: insertData[0].last_name,
        howHeard: insertData[0].how_heard,
        role: 'volunteer' as const,
      },
    };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to register volunteer' };
  }
};

export const loginVolunteer = async (credentials: z.infer<typeof loginSchema>): Promise<AuthResponse> => {
  try {
    console.log('Starting volunteer login process...');
    
    // Test database connection first with a simple query
    const { data: testData, error: testError } = await supabase
      .from('volunteer')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Database connection test failed:', testError);
      return { 
        success: false, 
        message: 'Cannot connect to database. Please try again later.' 
      };
    }
    
    console.log('Database connection successful, checking volunteer credentials...');
    
    // Verify if this volunteer exists in our database
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')
      .select('*')
      .eq('email', credentials.email)
      .single();
    
    if (volunteerError && volunteerError.code !== 'PGRST116') {
      console.error('Database error while fetching volunteer:', volunteerError);
      return { 
        success: false, 
        message: 'Error verifying account. Please try again.' 
      };
    }
    
    if (!volunteerData) {
      console.log('No volunteer found with this email');
      return { 
        success: false, 
        message: 'No volunteer account found with this email' 
      };
    }
    
    // Simple password check against the stored password
    if (volunteerData.password !== credentials.password) {
      console.log('Password does not match');
      return { 
        success: false, 
        message: 'Invalid email or password' 
      };
    }
    
    // Track login and handle badges
    try {
      // Create a record in login_tracking table
      const { error: loginTrackingError } = await supabase
        .from('login_tracking')
        .insert({
          volunteer_id: volunteerData.id,
          login_time: new Date().toISOString(),
          device_info: navigator.userAgent || 'Unknown',
          ip_address: 'Not recorded'
        });
        
      if (loginTrackingError) {
        // If table doesn't exist yet, just continue
        if (loginTrackingError.code === '42P01') { // "relation does not exist" error code
          console.warn('login_tracking table does not exist, skipping login tracking');
        } else {
          console.error('Error tracking login:', loginTrackingError);
        }
      } else {
        console.log('Login tracked successfully');
      }
      
      // Track login via points service (if this creates a tracking record, continue with that)
      await pointsService.trackLogin(volunteerData.id);
    } catch (error) {
      console.error('Error tracking login:', error);
      // Don't fail the login if tracking fails
    }
    
    // Create user object
    const user = {
      id: volunteerData.id,
      email: volunteerData.email,
      firstName: volunteerData.first_name,
      lastName: volunteerData.last_name,
      howHeard: volunteerData.how_heard,
      role: 'volunteer' as const,
    };
    
    console.log('Login successful');
    
    return {
      success: true,
      message: 'Logged in successfully',
      user
    };
  } catch (error: unknown) {
    const err = error as AppError;
    console.error('Login error:', err.message);
    return { 
      success: false, 
      message: err.message || 'Failed to log in' 
    };
  }
};

// Logout function
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to logout' };
  }
};

// Current user function
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    // Check if we have a Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, return null
    if (!session) {
      return null;
    }
    
    // Check if the user is an admin - note the table name is 'admin' not 'admins'
    const { data: adminData, error: adminError } = await supabase
      .from('admin')  // Changed from 'admins' to 'admin' to match the schema
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (adminData && !adminError) {
      // Convert snake_case DB column names to camelCase for frontend
      return {
        ...adminData,
        firstName: adminData.first_name,
        lastName: adminData.last_name,
        createdAt: adminData.created_at,
        updatedAt: adminData.updated_at,
        organizationId: adminData.organization_id,
        role: 'admin',
      };
    }
    
    // Check if the user is a volunteer - note the table name is 'volunteer' not 'volunteers'
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')  // Changed from 'volunteers' to 'volunteer' to match the schema
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (volunteerData && !volunteerError) {
      // Convert snake_case DB column names to camelCase for frontend
      return {
        ...volunteerData,
        firstName: volunteerData.first_name,
        lastName: volunteerData.last_name,
        howHeard: volunteerData.how_heard,
        createdAt: volunteerData.created_at,
        updatedAt: volunteerData.updated_at,
        role: 'volunteer',
      };
    }
    
    return null;
  } catch (error: unknown) {
    const err = error as AppError;
    console.error('Error getting current user:', err.message);
    return null;
  }
};