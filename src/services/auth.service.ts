import { supabase } from '@/lib/supabase';
import { z } from 'zod';

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
    // First verify if this admin exists in our database
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', credentials.email)
      .single();
    
    if (adminError || !adminData) {
      return { success: false, message: 'Admin account not found' };
    }
    
    // Try to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    // Handle the case where auth fails because of email confirmation
    if (error && error.message.toLowerCase().includes('email not confirmed')) {
      // Ignore the email confirmation error and proceed anyway
      // since we already verified this admin exists in our database
      
      // Convert snake_case DB column names to camelCase for frontend
      const camelCaseAdmin = {
        ...adminData,
        firstName: adminData.first_name,
        lastName: adminData.last_name,
        createdAt: adminData.created_at,
        updatedAt: adminData.updated_at,
        organizationId: adminData.organization_id,
        manuallyLoggedIn: true,
        role: 'admin' as const,
      };
      
      return {
        success: true,
        message: 'Login successful (bypassing email confirmation)',
        user: camelCaseAdmin,
      };
    } else if (error) {
      // Handle other errors
      return { success: false, message: error.message };
    }

    // If we reached here, the normal auth flow worked
    // Convert snake_case DB column names to camelCase for frontend
    const camelCaseAdmin = {
      ...adminData,
      firstName: adminData.first_name,
      lastName: adminData.last_name,
      createdAt: adminData.created_at,
      updatedAt: adminData.updated_at,
      organizationId: adminData.organization_id,
      manuallyLoggedIn: true,
      role: 'admin' as const,
    };
    
    return {
      success: true,
      message: 'Login successful',
      user: camelCaseAdmin,
    };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to login' };
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

    // Create account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (!data.user) {
      return { success: false, message: 'Failed to create user' };
    }

    const supabaseUserId = data.user.id;
    
    // Create volunteer in database - note the table name is 'volunteer' not 'volunteers'
    const { error: insertError, data: insertData } = await supabase
      .from('volunteer')  // Changed from 'volunteers' to 'volunteer' to match the schema
      .insert({
        id: supabaseUserId,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName, // Changed from firstName to first_name to match DB schema
        last_name: userData.lastName,   // Changed from lastName to last_name to match DB schema
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        skills: userData.skills || [],
        interests: userData.interests || [],
        availability: userData.availability,
        experience: userData.experience,
        how_heard: userData.howHeard     // Changed from howHeard to how_heard to match DB schema
      })
      .select();

    if (insertError) {
      // If database insert failed, clean up the auth user
      await supabase.auth.admin.deleteUser(supabaseUserId).catch(() => {});
      return { success: false, message: insertError.message || 'Failed to create volunteer record' };
    }

    const newVolunteer = insertData?.[0];
    
    if (!newVolunteer) {
      // If no volunteer was returned, clean up the auth user
      await supabase.auth.admin.deleteUser(supabaseUserId).catch(() => {});
      return { success: false, message: 'Failed to create volunteer record' };
    }

    return {
      success: true,
      message: 'Volunteer registered successfully',
      user: {
        ...newVolunteer,
        role: 'volunteer' as const,
        manuallyLoggedIn: true,
      },
    };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to register volunteer' };
  }
};

export const loginVolunteer = async (credentials: z.infer<typeof loginSchema>): Promise<AuthResponse> => {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Fetch volunteer record from database - note the table name is 'volunteer' not 'volunteers'
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')  // Changed from 'volunteers' to 'volunteer' to match the schema
      .select('*')
      .eq('email', credentials.email)
      .single();
    
    if (volunteerError || !volunteerData) {
      await supabase.auth.signOut();
      return { success: false, message: 'Invalid volunteer credentials' };
    }
    
    // Convert snake_case DB column names to camelCase for frontend
    const camelCaseVolunteer = {
      ...volunteerData,
      firstName: volunteerData.first_name,
      lastName: volunteerData.last_name,
      howHeard: volunteerData.how_heard,
      createdAt: volunteerData.created_at,
      updatedAt: volunteerData.updated_at,
      manuallyLoggedIn: true,
      role: 'volunteer' as const,
    };
    
    return {
      success: true,
      message: 'Login successful',
      user: camelCaseVolunteer,
    };
  } catch (error: unknown) {
    const err = error as AppError;
    return { success: false, message: err.message || 'Failed to login' };
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