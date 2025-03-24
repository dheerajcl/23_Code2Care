import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

/**
 * AuthService handles user authentication and session management
 */
class AuthService {
  // Cache the current session
  private currentSession: Session | null = null;
  private currentUser: User | null = null;

  /**
   * Get the current authenticated user
   * @returns The authenticated user or null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser) return this.currentUser;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: { user } } = await supabase.auth.getUser();
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get the current authenticated session
   * @returns The authenticated session or null
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      if (this.currentSession) return this.currentSession;

      const { data: { session } } = await supabase.auth.getSession();
      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Track a user login
   * @param userId The user ID
   */
  async trackLogin(userId: string): Promise<void> {
    try {
      if (!userId) return;

      // Get user agent and IP data
      const userAgent = navigator.userAgent;
      
      // Try to insert into login_tracking
      const { error } = await supabase
        .from('login_tracking')
        .insert({
          user_id: userId,
          login_time: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: 'client-side' // Can't get real IP on client side
        });

      if (error) {
        // Table might not exist yet or other error
        console.warn('Could not track login:', error.message);
      }
    } catch (error) {
      // Don't let login tracking errors affect the main application flow
      console.warn('Error tracking login:', error);
    }
  }

  /**
   * Sign in with email and password
   * @param email User email
   * @param password User password
   * @returns Authentication result
   */
  async signInWithPassword(email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string;
    data?: { user: User | null; session: Session | null } 
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      this.currentSession = data.session;
      this.currentUser = data.user;

      // Track this login
      if (data.user) {
        this.trackLogin(data.user.id).catch(console.error);
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sign in';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign out the current user
   * @returns Sign out result
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Clear cached user and session
      this.currentUser = null;
      this.currentSession = null;

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sign out';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get user profile type (admin, volunteer, or null)
   * @returns User profile type
   */
  async getUserProfileType(): Promise<{ type: 'admin' | 'volunteer' | null; id: string | null }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return { type: null, id: null };

      // Check if user is an admin
      const { data: adminData } = await supabase
        .from('admin')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (adminData) {
        return { type: 'admin', id: adminData.id };
      }

      // Check if user is a volunteer
      const { data: volunteerData } = await supabase
        .from('volunteer')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (volunteerData) {
        return { type: 'volunteer', id: volunteerData.id };
      }

      return { type: null, id: null };
    } catch (error) {
      console.error('Error getting user profile type:', error);
      return { type: null, id: null };
    }
  }
}

export const authService = new AuthService(); 