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
  role?: 'admin' | 'volunteer';
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

// Create separate contexts for Admin and Volunteer
const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);
const VolunteerAuthContext = createContext<VolunteerAuthContextType | undefined>(undefined);
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
      const { data, error } = await supabase
        .from('event_signup')
        .insert([{ event_id: eventId, volunteer_id: user?.id }])
        .select();

      if (error) {
        console.error('Error registering for event:', error);
        return false;
      }

      if (data && data.length > 0) {
        setRegisteredEvents({ ...registeredEvents, [eventId]: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in registerForEvent:', error);
      return false;
    }
  };

  return (
    <VolunteerAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth, registeredEvents, registerForEvent }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
};

// Legacy AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const adminUser = getStoredUser('adminUser');
    if (adminUser) return adminUser;
    
    const volunteerUser = getStoredUser('volunteerUser');
    if (volunteerUser) return volunteerUser;
    
    return getStoredUser('user');
  });
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<User>(null);
  const [volunteerUser, setVolunteerUser] = useState<User>(null);
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
        
        if (parsedUser?.role === 'admin') {
          setAdminUser(parsedUser);
        } else if (parsedUser?.role === 'volunteer') {
          setVolunteerUser(parsedUser);
          
          // Try to get registered events from localStorage
          const localRegisteredEvents = localStorage.getItem('registeredEvents');
          if (localRegisteredEvents) {
            try {
              setRegisteredEvents(JSON.parse(localRegisteredEvents));
            } catch (error) {
              console.error('Error parsing registeredEvents from localStorage:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }

    const checkUser = async () => {
      try {
        // ... existing code ...

        if (session?.user) {
          // ... existing code ...
          
          // Set role-specific user
          if (userData.role === 'admin') {
            setAdminUser(fullUser);
          } else if (userData.role === 'volunteer') {
            setVolunteerUser(fullUser);
            // Fetch registered events
            await fetchRegisteredEvents(fullUser.id);
          }
        } else {
          setUser(null);
          setAdminUser(null);
          setVolunteerUser(null);
          setRegisteredEvents({});
          localStorage.removeItem('user');
          localStorage.removeItem('registeredEvents');
        }
      } catch (err) {
        console.error('Error checking user:', err);
        // Clear bad data if there's an error
        setUser(null);
        setAdminUser(null);
        setVolunteerUser(null);
        setRegisteredEvents({});
        localStorage.removeItem('user');
        localStorage.removeItem('registeredEvents');
      } finally {
        setLoading(false);
      }
    };

    // ... existing code ...

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // ... existing code ...
        
        // Set role-specific user
        if (userData.role === 'admin') {
          setAdminUser(fullUser);
        } else if (userData.role === 'volunteer') {
          setVolunteerUser(fullUser);
          // Fetch registered events
          await fetchRegisteredEvents(fullUser.id);
        }

        // ... existing code ...
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAdminUser(null);
        setVolunteerUser(null);
        setRegisteredEvents({});
        localStorage.removeItem('user');
        localStorage.removeItem('registeredEvents');
      }
    });

    // ... existing code ...
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
      setAdminUser(null);
      setVolunteerUser(null);
      setRegisteredEvents({});
      localStorage.removeItem('user');
      localStorage.removeItem('registeredEvents');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Role-specific auth values
  const volunteerAuthValue = {
    user: volunteerUser,
    loading,
    logout,
    registeredEvents
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

// Backwards compatibility for existing code
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 