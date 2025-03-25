import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logout as logoutService } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

// Types
type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'volunteer' | 'webmaster';
  [key: string]: string | number | boolean | undefined;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  registeredEvents: Record<string, boolean>;
};

type VolunteerAuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  registeredEvents: Record<string, boolean>;
  registerForEvent: (eventId: string) => Promise<boolean>;
};

// Create separate contexts for Admin, Volunteer, and Webmaster
const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);
const VolunteerAuthContext = createContext<VolunteerAuthContextType | undefined>(undefined);
const WebmasterAuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get user data from localStorage helper function
const getStoredUser = (key: string) => {
  try {
    const userData = localStorage.getItem(key);
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key);
  }
  return null;
};

// Admin Provider component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser('adminUser'));
  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});

  // Update localStorage when admin user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      // Also update shared user for backwards compatibility
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('adminUser');
    }
  }, [user]);

  // Logout function for admin
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      // Clear admin user state
      setUser(null);
      
      // Clear ALL user data from localStorage for complete logout
      localStorage.removeItem('adminUser');
      localStorage.removeItem('volunteerUser');
      localStorage.removeItem('user');
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your admin account',
      });
    } catch (error) {
      console.error('Error logging out admin:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for authenticated admin user
  const checkAuth = async () => {
    try {
      setLoading(true);
      const adminUser = getStoredUser('adminUser');
      if (adminUser?.role === 'admin') {
        setUser(adminUser);
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth, registeredEvents }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Volunteer Provider component
export const VolunteerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser('volunteerUser'));
  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});

  // Check for authenticated volunteer user
  const checkAuth = async () => {
    try {
      setLoading(true);
      const volunteerUser = getStoredUser('volunteerUser');
      if (volunteerUser?.role === 'volunteer') {
        setUser(volunteerUser);
      }
    } catch (error) {
      console.error('Error checking volunteer auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered events whenever user changes (logs in)
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user || user.role !== 'volunteer') return;
      
      try {
        const { data, error } = await supabase
          .from('event_signup')
          .select('event_id')
          .eq('volunteer_id', user.id);
        
        if (error) {
          console.error('Error fetching event registrations:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const registrationMap: Record<string, boolean> = {};
          data.forEach(reg => {
            registrationMap[reg.event_id] = true;
          });
          setRegisteredEvents(registrationMap);
        }
      } catch (err) {
        console.error('Error fetching event registrations:', err);
      }
    };
    
    fetchRegisteredEvents();
  }, [user]);

  // Update localStorage when volunteer user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('volunteerUser', JSON.stringify(user));
      
      // Also update shared user for backwards compatibility
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('volunteerUser');
    }
  }, [user]);

  // Logout function for volunteer
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      // Clear volunteer user state
      setUser(null);
      // Clear registrations
      setRegisteredEvents({});
      
      // Clear ALL user data from localStorage for complete logout
      localStorage.removeItem('adminUser');
      localStorage.removeItem('volunteerUser');
      localStorage.removeItem('user');
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your volunteer account',
      });
    } catch (error) {
      console.error('Error logging out volunteer:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: string) => {
    try {
      // Step 1: Fetch event details to get max_volunteers
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('max_volunteers, title') // Include title for better messages
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error fetching event details:', eventError);
        return { success: false, message: `Failed to fetch event details: ${eventError.message}` };
      }

      const maxVolunteers = eventData?.max_volunteers || null; // null means unlimited
      const eventTitle = eventData?.title || 'this event'; // Fallback title

      // Step 2: Count current registered volunteers
      const { data: signupData, error: signupError } = await supabase
        .from('event_signup')
        .select('id', { count: 'exact' })
        .eq('event_id', eventId);

      if (signupError) {
        console.error('Error counting registered volunteers:', signupError);
        return { success: false, message: `Failed to count registered volunteers: ${signupError.message}` };
      }

      const currentVolunteers = signupData.length;

      // Step 3: Check if max_volunteers is exceeded
      if (maxVolunteers !== null && currentVolunteers >= maxVolunteers) {
        console.log(`Event ${eventId} has reached its maximum volunteer capacity of ${maxVolunteers}`);
        return { 
          success: false, 
          message: `Registration failed: "${eventTitle}" has reached its maximum volunteer capacity of ${maxVolunteers}.` 
        };
      }

      // Step 4: Proceed with registration if limit not reached
      const { data, error } = await supabase
        .from('event_signup')
        .insert([{ event_id: eventId, volunteer_id: user?.id }])
        .select();

      if (error) {
        console.error('Error registering for event:', error);
        return { success: false, message: `Failed to register for "${eventTitle}": ${error.message}` };
      }

      if (data && data.length > 0) {
        setRegisteredEvents({ ...registeredEvents, [eventId]: true });
        return { 
          success: true, 
          message: `Successfully registered as a volunteer for "${eventTitle}"!` 
        };
      }

      return { success: false, message: `Registration failed for "${eventTitle}": No data returned.` };
    } catch (error) {
      console.error('Error in registerForEvent:', error);
      return { success: false, message: `An unexpected error occurred while registering for "${eventTitle}": ${error.message}` };
    }
  };

  return (
    <VolunteerAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth, registeredEvents, registerForEvent }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
};

// Webmaster Provider component
export const WebmasterAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser('webmasterUser'));
  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});

  // Update localStorage when webmaster user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('webmasterUser', JSON.stringify(user));
      
      // Also update shared user for backwards compatibility
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('webmasterUser');
    }
  }, [user]);

  // Logout function for webmaster
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      // Clear webmaster user state
      setUser(null);
      
      // Clear webmaster user data from localStorage
      localStorage.removeItem('webmasterUser');
      localStorage.removeItem('user');
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your webmaster account',
      });
    } catch (error) {
      console.error('Error logging out webmaster:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for authenticated webmaster user
  const checkAuth = async () => {
    try {
      setLoading(true);
      const webmasterUser = getStoredUser('webmasterUser');
      if (webmasterUser?.role === 'webmaster') {
        setUser(webmasterUser);
      }
    } catch (error) {
      console.error('Error checking webmaster auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebmasterAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth, registeredEvents }}>
      {children}
    </WebmasterAuthContext.Provider>
  );
};

// Legacy AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const adminUser = getStoredUser('adminUser');
    if (adminUser) return adminUser;
    
    const volunteerUser = getStoredUser('volunteerUser');
    if (volunteerUser) return volunteerUser;
    
    const webmasterUser = getStoredUser('webmasterUser');
    if (webmasterUser) return webmasterUser;
    
    return getStoredUser('user');
  });
  const [loading, setLoading] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  // Check for authenticated user
  const checkAuth = async () => {
    try {
      setLoading(true);
      // Check admin user first
      const adminUser = getStoredUser('adminUser');
      if (adminUser) {
        setUser(adminUser);
        return;
      }

      // Check volunteer user
      const volunteerUser = getStoredUser('volunteerUser');
      if (volunteerUser) {
        setUser(volunteerUser);
        return;
      }
      
      // Check webmaster user
      const webmasterUser = getStoredUser('webmasterUser');
      if (webmasterUser) {
        setUser(webmasterUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update role-specific storage when user changes in legacy context
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Also update role-specific storage
      if (user.role === 'admin') {
        localStorage.setItem('adminUser', JSON.stringify(user));
      } else if (user.role === 'volunteer') {
        localStorage.setItem('volunteerUser', JSON.stringify(user));
      } else if (user.role === 'webmaster') {
        localStorage.setItem('webmasterUser', JSON.stringify(user));
      }
    }
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    // Try to get user from localStorage first for instant render
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }

    // Handle auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRegisteredEvents({});
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('volunteerUser');
        localStorage.removeItem('webmasterUser');
        localStorage.removeItem('registeredEvents');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchRegisteredEvents = async (userId?: string) => {
    try {
      const id = userId || user?.id;
      if (!id) return;

      const { data, error } = await supabase
        .from('event_signup')
        .select('event_id')
        .eq('volunteer_id', id);

      if (error) {
        console.error('Error fetching registered events:', error);
        return;
      }

      // Convert array to object map for easier lookup
      const eventsMap = data.reduce((acc, item) => {
        acc[item.event_id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setRegisteredEvents(eventsMap);
      localStorage.setItem('registeredEvents', JSON.stringify(eventsMap));
    } catch (error) {
      console.error('Error in fetchRegisteredEvents:', error);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setRegisteredEvents({});
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('volunteerUser');
      localStorage.removeItem('webmasterUser');
      localStorage.removeItem('registeredEvents');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, checkAuth, registeredEvents }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hooks to use auth contexts
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export function useVolunteerAuth() {
  const context = useContext(VolunteerAuthContext);
  if (context === undefined) {
    throw new Error('useVolunteerAuth must be used within a VolunteerAuthProvider');
  }
  return context;
}

// Use webmaster auth hook
export function useWebmasterAuth() {
  const context = useContext(WebmasterAuthContext);
  if (context === undefined) {
    throw new Error('useWebmasterAuth must be used within a WebmasterAuthProvider');
  }
  return context;
}

// Backwards compatibility for existing code
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 