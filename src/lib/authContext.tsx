import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { getCurrentUser } from '@/services/auth.service';
import { toast } from '@/components/ui/use-toast';

// Types
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'volunteer';
  [key: string]: any; // For additional properties
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<User | null>;
  logout: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to check if user is authenticated
  const checkAuth = async () => {
    try {
      // First, try getting user through Supabase session
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        return currentUser;
      }
      
      // If no user found through session, check localStorage for admin users
      // This is our fallback for admin users with unconfirmed emails
      const savedAdmin = localStorage.getItem('adminUser');
      if (savedAdmin) {
        try {
          const adminUser = JSON.parse(savedAdmin);
          // Validate that this is a proper user object
          if (adminUser && adminUser.id && adminUser.email && adminUser.role === 'admin') {
            setUser(adminUser);
            return adminUser;
          }
        } catch (e) {
          // Invalid JSON, clear it
          localStorage.removeItem('adminUser');
        }
      }
      
      setUser(null);
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('adminUser');
      
      // Clear user state
      setUser(null);
      
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
    }
  };

  // Check auth on initial load
  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = await checkAuth();
          if (user) {
            toast({
              title: 'Signed in',
              description: `Welcome back, ${user.firstName}!`,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          // Clear admin fallback on sign out
          localStorage.removeItem('adminUser');
          toast({
            title: 'Signed out',
            description: 'You have been signed out.',
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 