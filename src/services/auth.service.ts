import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock data for browser environments
const mockData = {
  admins: [
    {
      id: '1',
      email: 'admin@samarthanam.org',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  volunteers: [
    {
      id: '1',
      email: 'volunteer@example.com',
      firstName: 'Volunteer',
      lastName: 'User',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      state: 'karnataka',
      skills: ['Teaching', 'Technology'],
      interests: ['Education', 'Community Outreach'],
      availability: 'weekends',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

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
  user?: any;
};

// Admin authentication
export const registerAdmin = async (userData: z.infer<typeof adminRegisterSchema>): Promise<AuthResponse> => {
  try {
    // Create Supabase user for authentication
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: 'admin',
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }
    
    // If in browser, use mock data directly
    if (isBrowser) {
      // Check if email already exists in mock data
      const existingAdmin = mockData.admins.find(admin => admin.email === userData.email);
      if (existingAdmin) {
        await supabase.auth.signOut();
        return { success: false, message: 'Email already in use' };
      }
      
      // Create a new mock admin
      const newAdmin = {
        id: String(mockData.admins.length + 1),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockData.admins.push(newAdmin);
      
      return {
        success: true,
        message: 'Admin registered successfully',
        user: { ...data.user, role: 'admin', ...newAdmin },
      };
    } else {
      // In a server environment, we'd use Prisma here
      // This code path won't be executed in the browser
      return {
        success: true,
        message: 'Admin registered successfully',
        user: { ...data.user, role: 'admin' },
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to register admin' };
  }
};

export const loginAdmin = async (credentials: z.infer<typeof loginSchema>): Promise<AuthResponse> => {
  try {
    // If in browser and using mock admin credentials, bypass Supabase
    if (isBrowser) {
      const admin = mockData.admins.find(a => a.email === credentials.email);
      
      if (admin && credentials.email === 'admin@samarthanam.org' && credentials.password === 'Admin@123') {
        const mockUser = { 
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin',
          ...admin 
        };
        
        // Store in localStorage to maintain the session
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        
        return {
          success: true,
          message: 'Login successful',
          user: mockUser,
        };
      }
    }
    
    // Otherwise proceed with Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, message: error.message };
    }
    
    // If in browser, use mock data
    if (isBrowser) {
      // Find admin in mock data
      const admin = mockData.admins.find(a => a.email === credentials.email);
      
      if (!admin) {
        await supabase.auth.signOut();
        return { success: false, message: 'Invalid admin credentials' };
      }
      
      return {
        success: true,
        message: 'Login successful',
        user: { ...data.user, role: 'admin', ...admin },
      };
    } else {
      // In server environment, we'd fetch from database
      return {
        success: true,
        message: 'Login successful',
        user: { ...data.user, role: 'admin' },
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to login' };
  }
};

// Volunteer authentication
export const registerVolunteer = async (userData: z.infer<typeof volunteerRegisterSchema>): Promise<AuthResponse> => {
  try {
    // Create Supabase user for authentication
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: 'volunteer',
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }
    
    // If in browser, use mock data directly
    if (isBrowser) {
      // Check if email already exists in mock data
      const existingVolunteer = mockData.volunteers.find(vol => vol.email === userData.email);
      if (existingVolunteer) {
        await supabase.auth.signOut();
        return { success: false, message: 'Email already in use' };
      }
      
      // Create a new mock volunteer
      const newVolunteer = {
        id: String(mockData.volunteers.length + 1),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        skills: userData.skills,
        interests: userData.interests,
        availability: userData.availability,
        experience: userData.experience,
        howHeard: userData.howHeard,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockData.volunteers.push(newVolunteer);
      
      return {
        success: true,
        message: 'Volunteer registered successfully',
        user: { ...data.user, role: 'volunteer', ...newVolunteer },
      };
    } else {
      // In a server environment, we'd use Prisma here
      return {
        success: true,
        message: 'Volunteer registered successfully',
        user: { ...data.user, role: 'volunteer' },
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to register volunteer' };
  }
};

export const loginVolunteer = async (credentials: z.infer<typeof loginSchema>): Promise<AuthResponse> => {
  try {
    // If in browser and using mock volunteer credentials, bypass Supabase
    if (isBrowser) {
      const volunteer = mockData.volunteers.find(v => v.email === credentials.email);
      
      if (volunteer && credentials.email === 'volunteer@example.com' && credentials.password === 'Volunteer@123') {
        const mockUser = { 
          id: volunteer.id,
          email: volunteer.email,
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          role: 'volunteer',
          ...volunteer 
        };
        
        // Store in localStorage to maintain the session
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        
        return {
          success: true,
          message: 'Login successful',
          user: mockUser,
        };
      }
    }
    
    // Otherwise proceed with Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, message: error.message };
    }
    
    // If in browser, use mock data
    if (isBrowser) {
      // Find volunteer in mock data
      const volunteer = mockData.volunteers.find(v => v.email === credentials.email);
      
      if (!volunteer) {
        await supabase.auth.signOut();
        return { success: false, message: 'Invalid volunteer credentials' };
      }
      
      return {
        success: true,
        message: 'Login successful',
        user: { ...data.user, role: 'volunteer', ...volunteer },
      };
    } else {
      // In server environment, we'd fetch from database
      return {
        success: true,
        message: 'Login successful',
        user: { ...data.user, role: 'volunteer' },
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to login' };
  }
};

// Logout function for both admin and volunteer
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Clear mock user from localStorage
    if (isBrowser) {
      localStorage.removeItem('mockUser');
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to logout' };
  }
};

// Current user function
export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  try {
    // If in browser, check localStorage for mock user first
    if (isBrowser) {
      const mockUserString = localStorage.getItem('mockUser');
      if (mockUserString) {
        try {
          const mockUser = JSON.parse(mockUserString);
          
          // Verify this is a valid mock user by checking against our mock data
          if (mockUser.email === 'admin@samarthanam.org' || mockUser.email === 'volunteer@example.com') {
            return {
              ...mockUser,
              role: mockUser.email === 'admin@samarthanam.org' ? 'admin' : 'volunteer'
            };
          }
        } catch (e) {
          // Invalid JSON in localStorage, ignore and continue with normal flow
          localStorage.removeItem('mockUser');
        }
      }
    }
    
    // If no mock user found or not in browser, continue with normal flow
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    // Determine role based on email or other criteria
    // For real application, we would fetch this data from the database
    // For now, we'll just check against mock data for simplicity
    
    if (isBrowser) {
      // When in browser, check if user matches our mock data
      const adminUser = mockData.admins.find(admin => admin.email === session.user.email);
      if (adminUser) {
        return {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: 'admin',
          ...adminUser
        };
      }
      
      const volunteerUser = mockData.volunteers.find(vol => vol.email === session.user.email);
      if (volunteerUser) {
        return {
          id: volunteerUser.id,
          email: volunteerUser.email,
          firstName: volunteerUser.firstName,
          lastName: volunteerUser.lastName,
          role: 'volunteer',
          ...volunteerUser
        };
      }
    } else {
      // Server environment - would query the database
      // For demo purposes, return a mock response based on email
      if (session.user.email?.includes('admin')) {
        return {
          id: session.user.id,
          email: session.user.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        };
      } else {
        return {
          id: session.user.id,
          email: session.user.email,
          firstName: 'Volunteer',
          lastName: 'User',
          role: 'volunteer'
        };
      }
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting current user:', error.message);
    return null;
  }
}; 