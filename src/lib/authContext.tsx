import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logout as logoutService } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';

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
};

// Create separate contexts for Admin and Volunteer
const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);
const VolunteerAuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin Provider component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load admin user from localStorage on initial mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Only set admin user if the role is correct
          if (parsedUser && parsedUser.role === 'admin') {
            setUser(parsedUser);
          } else {
            // Remove invalid admin user data
            console.warn('Found invalid admin user data in localStorage', parsedUser);
            localStorage.removeItem('adminUser');
          }
        }
      } catch (error) {
        console.error('Error loading admin user from localStorage:', error);
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Update localStorage when admin user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
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
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Validate that this is an admin user
        if (parsedUser?.role === 'admin') {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Volunteer Provider component
export const VolunteerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load volunteer user from localStorage on initial mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('volunteerUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Only set volunteer user if the role is correct
          if (parsedUser && parsedUser.role === 'volunteer') {
            setUser(parsedUser);
          } else {
            // Remove invalid volunteer user data
            console.warn('Found invalid volunteer user data in localStorage', parsedUser);
            localStorage.removeItem('volunteerUser');
          }
        }
      } catch (error) {
        console.error('Error loading volunteer user from localStorage:', error);
        localStorage.removeItem('volunteerUser');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Update localStorage when volunteer user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('volunteerUser', JSON.stringify(user));
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

  // Check for authenticated volunteer user
  const checkAuth = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('volunteerUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Validate that this is a volunteer user
        if (parsedUser?.role === 'volunteer') {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error checking volunteer auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VolunteerAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
};

// Legacy AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check both admin and volunteer localStorage data
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check for admin user first
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
          setUser(JSON.parse(adminUser));
          setLoading(false);
          return;
        }
        
        // Check for volunteer user
        const volunteerUser = localStorage.getItem('volunteerUser');
        if (volunteerUser) {
          setUser(JSON.parse(volunteerUser));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Logout function for legacy context
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      setUser(null);
      
      // Clear ALL user data from localStorage for complete logout
      localStorage.removeItem('adminUser');
      localStorage.removeItem('volunteerUser');
      localStorage.removeItem('user');
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for authenticated user
  const checkAuth = async () => {
    try {
      setLoading(true);
      // Check admin user first
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        setUser(JSON.parse(adminUser));
        setLoading(false);
        return;
      }
      
      // Check volunteer user
      const volunteerUser = localStorage.getItem('volunteerUser');
      if (volunteerUser) {
        setUser(JSON.parse(volunteerUser));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, checkAuth }}>
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