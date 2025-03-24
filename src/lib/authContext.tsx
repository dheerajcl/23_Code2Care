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
    <AdminAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Volunteer Provider component
export const VolunteerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser('volunteerUser'));
  const [loading, setLoading] = useState(false);

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

  return (
    <VolunteerAuthContext.Provider value={{ user, loading, logout, setUser, checkAuth }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
};

// Legacy AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const adminUser = getStoredUser('adminUser');
    if (adminUser) return adminUser;
    
    const volunteerUser = getStoredUser('volunteerUser');
    if (volunteerUser) return volunteerUser;
    
    return getStoredUser('user');
  });
  const [loading, setLoading] = useState(false);

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