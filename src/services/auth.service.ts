import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { pointsService } from './points.service';
import bcryptjs from 'bcryptjs';

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

// Password reset schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
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

    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.password);

    // Insert admin record directly regardless of email confirmation
    const { error: insertError, data: insertData } = await supabase
      .from('admin')
      .insert({
        id: userId,
        email: userData.email,
        password: hashedPassword, // Store hashed password instead of plaintext
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
    
    // Check if password is hashed (starts with $2a$)
    const isHashed = adminData.password.startsWith('$2a$');
    
    let passwordValid = false;
    if (isHashed) {
      // Use bcrypt compare for hashed passwords
      passwordValid = await comparePassword(credentials.password, adminData.password);
    } else {
      // Legacy comparison for plaintext passwords
      passwordValid = adminData.password === credentials.password;
      
      // If using plaintext password, hash it now for future security
      if (passwordValid) {
        const hashedPassword = await hashPassword(credentials.password);
        const { error: updateError } = await supabase
          .from('admin')
          .update({ password: hashedPassword })
          .eq('id', adminData.id);
          
        if (updateError) {
          console.error('Error updating to hashed password:', updateError);
          // Continue anyway since login is successful
        } else {
          console.log('Updated admin password to secure hash');
        }
      }
    }
    
    if (!passwordValid) {
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

    console.log('Creating new volunteer account...');
    
    // Create account with Supabase Auth - skip confirmation email
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: 'volunteer' // Add role metadata
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      console.error('Error creating Supabase Auth account:', error);
      return { success: false, message: error.message };
    }

    if (!data.user) {
      console.error('No user returned from Supabase Auth signUp');
      return { success: false, message: 'Failed to create user' };
    }

    console.log('Successfully created Supabase Auth account, user:', data.user.id);
    const userId = data.user.id;
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    console.log('Creating volunteer record in database...');
    
    // Create volunteer in database
    const { error: insertError, data: insertData } = await supabase
      .from('volunteer')
      .insert({
        id: userId,
        email: userData.email,
        password: hashedPassword, // Store hashed password instead of plaintext
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
      console.error('Error creating volunteer record:', insertError);
      return { success: false, message: insertError.message || 'Failed to create volunteer record' };
    }

    if (!insertData?.[0]) {
      console.error('No volunteer record returned after insert');
      return { success: false, message: 'Failed to create volunteer record' };
    }

    console.log('Successfully created volunteer record');
    
    // Attempt to sign in immediately regardless of whether email confirmation is required
    // This is similar to the approach used in registerAdmin
    try {
      console.log('Attempting to sign in new volunteer immediately...');
      
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });
      
      if (signInError) {
        console.warn('Could not sign in automatically after registration:', signInError);
        // Continue anyway, we'll return success
      } else {
        console.log('Auto sign-in successful');
      }
    } catch (signInError) {
      console.warn('Error during auto sign-in after registration:', signInError);
      // Continue anyway
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
    console.error('Error registering volunteer:', err);
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
    
    console.log('Volunteer found, checking password...');
    
    // User data to return on successful login
    const user = {
      id: volunteerData.id,
      email: volunteerData.email,
      firstName: volunteerData.first_name,
      lastName: volunteerData.last_name,
      howHeard: volunteerData.how_heard,
      role: 'volunteer' as const,
    };
    
    // First try to authenticate with Supabase Auth (this is the primary authentication)
    try {
      console.log('Attempting Supabase Auth login...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (!authError && authData.user) {
        console.log('Supabase Auth login successful');
        
        // Also update the database password if it's not already hashed
        if (volunteerData.password && !volunteerData.password.startsWith('$2a$')) {
          console.log('Updating plaintext password to hash in database');
          try {
            const hashedPassword = await hashPassword(credentials.password);
            await supabase
              .from('volunteer')
              .update({ password: hashedPassword })
              .eq('id', volunteerData.id);
          } catch (updateError) {
            console.warn('Error updating password to hash:', updateError);
            // Continue anyway, this is not critical
          }
        }
        
        // Track login using a safer approach
        try {
          trackSuccessfulLogin(volunteerData.id);
        } catch (trackingError) {
          console.error('Error in login tracking:', trackingError);
          // Don't fail the login if tracking fails
        }
        
        console.log('Login successful');
        return {
          success: true,
          message: 'Logged in successfully',
          user
        };
      } else {
        // If Supabase Auth failed, try local database authentication as fallback
        console.log('Supabase Auth login failed, trying database password comparison:', authError?.message);
        return await tryLocalAuth();
      }
    } catch (authError) {
      console.error('Error during Supabase Auth login:', authError);
      // If any error occurs in Supabase Auth, try local database authentication
      return await tryLocalAuth();
    }
    
    // Local database authentication function
    async function tryLocalAuth(): Promise<AuthResponse> {
      try {
        // Check if password is hashed (starts with $2a$)
        const isHashed = volunteerData.password && volunteerData.password.startsWith('$2a$');
        console.log('Password is', isHashed ? 'hashed' : 'plaintext');
        
        let passwordValid = false;
        if (isHashed) {
          // Use bcrypt compare for hashed passwords
          try {
            passwordValid = await comparePassword(credentials.password, volunteerData.password);
            console.log('Bcrypt comparison result:', passwordValid);
          } catch (bcryptError) {
            console.error('Error comparing passwords with bcrypt:', bcryptError);
            return { 
              success: false, 
              message: 'Error verifying password. Please try again.' 
            };
          }
        } else {
          // Legacy comparison for plaintext passwords
          passwordValid = volunteerData.password === credentials.password;
          console.log('Plaintext comparison result:', passwordValid);
          
          // If using plaintext password, hash it now for future security
          if (passwordValid) {
            try {
              console.log('Updating plaintext password to hash');
              const hashedPassword = await hashPassword(credentials.password);
              const { error: updateError } = await supabase
                .from('volunteer')
                .update({ password: hashedPassword })
                .eq('id', volunteerData.id);
                
              if (updateError) {
                console.error('Error updating to hashed password:', updateError);
                // Continue anyway since login is successful
              } else {
                console.log('Updated volunteer password to secure hash');
              }
            } catch (hashError) {
              console.error('Error hashing password:', hashError);
              // Continue anyway since login is successful
            }
          }
        }
        
        if (!passwordValid) {
          console.log('Password does not match');
          return { 
            success: false, 
            message: 'Invalid email or password' 
          };
        }
        
        // If local auth is successful, try to set up Supabase Auth for future logins
        try {
          console.log('Local auth successful, setting up Supabase Auth for future logins');
          
          // We can't use admin functions directly, so instead check if auth login works
          console.log('Checking if user exists in Supabase Auth...');
          const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (userError || !userData.user) {
            // User doesn't exist in Supabase Auth, create them
            console.log('User not found in Supabase Auth, creating...');
            try {
              await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                  data: { role: 'volunteer' }
                }
              });
            } catch (signupError) {
              console.error('Error creating user in Supabase Auth:', signupError);
              // Continue anyway since local login is successful
            }
          } else {
            // User exists but password might be out of sync, update it
            console.log('User found in Supabase Auth, updating password if needed');
            try {
              const { error: updateError } = await supabase.auth.updateUser({
                password: credentials.password
              });
              
              if (updateError) {
                console.error('Error updating Supabase Auth password:', updateError);
              }
            } catch (updateError) {
              console.error('Error updating Supabase Auth password:', updateError);
              // Continue anyway since local login is successful
            }
          }
        } catch (authSyncError) {
          console.error('Error syncing with Supabase Auth:', authSyncError);
          // Continue anyway since local login is successful
        }
        
        // Track login using a safer approach
        try {
          trackSuccessfulLogin(volunteerData.id);
        } catch (trackingError) {
          console.error('Error in login tracking:', trackingError);
          // Don't fail the login if tracking fails
        }
        
        console.log('Login successful via local auth');
        return {
          success: true,
          message: 'Logged in successfully',
          user
        };
      } catch (localAuthError) {
        console.error('Unexpected error in local auth:', localAuthError);
        return {
          success: false,
          message: 'Unexpected error during login. Please try again.'
        };
      }
    }
  } catch (error: unknown) {
    const err = error as AppError;
    console.error('Login error:', err.message);
    return { 
      success: false, 
      message: err.message || 'Failed to log in' 
    };
  }
};

// Helper function to track successful logins
async function trackSuccessfulLogin(volunteerId: string) {
  console.log('Tracking successful login for volunteer:', volunteerId);
  
  // Try to create a record in login_tracking table if it exists
  try {
    console.log('Tracking login in login_tracking table...');
    await supabase
      .from('login_tracking')
      .insert({
        volunteer_id: volunteerId,
        login_time: new Date().toISOString(),
        device_info: navigator.userAgent || 'Unknown',
        ip_address: 'Not recorded'
      });
    console.log('Login tracking record created successfully');
  } catch (trackingError) {
    console.warn('Error accessing login_tracking table, it might not exist:', trackingError);
    // Continue anyway, this is not critical
  }
    
  // Try to track login via points service
  try {
    console.log('Tracking login via points service...');
    await pointsService.trackLogin(volunteerId);
    console.log('Login tracked via points service successfully');
  } catch (pointsError) {
    console.warn('Error tracking login via points service:', pointsError);
    // Continue anyway, this is not critical
  }
}

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

// Request password reset
export const requestPasswordReset = async (data: z.infer<typeof forgotPasswordSchema>): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting password reset process for email:', data.email);
    
    // First check if the email exists in our volunteer database
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')
      .select('email')
      .eq('email', data.email)
      .single();
    
    if (volunteerError && volunteerError.code !== 'PGRST116') {
      console.error('Error checking volunteer email:', volunteerError);
      return { 
        success: false, 
        message: 'Error processing request. Please try again.' 
      };
    }
    
    if (!volunteerData) {
      console.log('No volunteer found with this email:', data.email);
      // Don't reveal that email doesn't exist for security reasons
      return { 
        success: true, 
        message: 'If your email exists in our system, you will receive password reset instructions.' 
      };
    }

    console.log('Volunteer found, sending password reset email to:', data.email);

    // Use Supabase Auth to send password reset email
    console.log('Sending password reset email via Supabase Auth');
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      // If the error message contains "User not found" or similar, it means 
      // the user exists in our volunteer table but not in Supabase Auth
      if (error.message.includes('User not found') || error.message.includes('No user found')) {
        console.warn('Email exists in volunteer table but not in Supabase Auth:', data.email);
        
        // Create a user in Supabase Auth if they don't exist
        console.log('Attempting to create user in Supabase Auth first...');
        
        // Since we don't know the password, generate a temporary one
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: tempPassword,
          options: {
            data: {
              role: 'volunteer'
            }
          }
        });
        
        if (signUpError) {
          console.error('Failed to create user in Supabase Auth:', signUpError);
          return {
            success: false,
            message: 'Unable to process your request. Please contact support.'
          };
        }
        
        console.log('User created in Supabase Auth, trying password reset again');
        
        // Try again with the password reset
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (resetError) {
          console.error('Error sending password reset email after creating user:', resetError);
          return { 
            success: false, 
            message: 'Failed to send password reset email. Please contact support: ' + resetError.message
          };
        }
      } else {
        console.error('Error sending password reset email:', error);
        return { 
          success: false, 
          message: 'Failed to send password reset email. Please contact support: ' + error.message
        };
      }
    }

    console.log('Password reset email sent successfully');
    return { 
      success: true, 
      message: 'Password reset instructions sent to your email. Please check your inbox and spam folder.' 
    };
  } catch (error: unknown) {
    console.error('Unexpected error during password reset request:', error);
    const err = error as AppError;
    return { 
      success: false, 
      message: err.message || 'Failed to request password reset.' 
    };
  }
};

// Add these helper functions before the resetPassword function

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns True if passwords match
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};

// Update the resetPassword function
export const resetPassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting password reset process');
    
    // Get the current session to identify the user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session for password reset:', sessionError);
      return { 
        success: false, 
        message: 'Authentication error. Please try again.' 
      };
    }
    
    if (!sessionData.session) {
      console.error('No active session found for password reset');
      return { 
        success: false, 
        message: 'You must be authenticated to reset your password. Please try requesting a new reset link.' 
      };
    }
    
    const userId = sessionData.session.user.id;
    const userEmail = sessionData.session.user.email;
    
    console.log('Resetting password for user:', { id: userId, email: userEmail });
    
    // Update password in Supabase Auth
    console.log('Updating password in Supabase Auth...');
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Error resetting password in Supabase Auth:', updateError);
      return { 
        success: false, 
        message: 'Failed to reset password: ' + updateError.message
      };
    }
    
    console.log('Successfully updated password in Supabase Auth');
    
    // Hash the new password before storing in the database
    console.log('Hashing password for database storage...');
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password in the volunteer table
    console.log('Updating password in volunteer table...');
    let volunteerUpdated = false;
    try {
      const { error: volunteerError } = await supabase
        .from('volunteer')
        .update({ password: hashedPassword })
        .eq('id', userId);
        
      if (volunteerError) {
        console.error('Error updating volunteer password in database:', volunteerError);
        // Don't fail the process if this update fails, as Supabase Auth is the primary source
        console.warn('Password updated in Auth but not in volunteer table');
      } else {
        console.log('Volunteer password updated successfully in database');
        volunteerUpdated = true;
      }
    } catch (error) {
      console.error('Exception updating volunteer password:', error);
    }
    
    // Also try to update admin table in case this is an admin
    console.log('Checking if user is admin, updating admin table if needed...');
    let adminUpdated = false;
    try {
      const { error: adminError } = await supabase
        .from('admin')
        .update({ password: hashedPassword })
        .eq('id', userId);
        
      if (adminError) {
        // This is likely not an admin, which is fine
        console.log('Not updating admin password (likely not an admin)');
      } else {
        console.log('Admin password updated successfully in database');
        adminUpdated = true;
      }
    } catch (error) {
      console.error('Exception updating admin password:', error);
    }
    
    if (!volunteerUpdated && !adminUpdated) {
      console.warn('Password was updated in Supabase Auth but could not be updated in either volunteer or admin tables');
      // We still return success since the Supabase Auth update worked
    }

    // Sign out to ensure clean state for next login
    try {
      console.log('Signing out user to clean up session state...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out after password reset:', error);
      // Continue anyway
    }

    console.log('Password reset completed successfully');
    return { 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    };
  } catch (error: unknown) {
    console.error('Unexpected error during password reset:', error);
    const err = error as AppError;
    return { 
      success: false, 
      message: err.message || 'Failed to reset password.' 
    };
  }
};