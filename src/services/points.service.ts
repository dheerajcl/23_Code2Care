import { supabase } from '@/lib/supabase';
import { getVolunteerLeaderboard, getVolunteerRank } from './database.service';

interface PointsEntry {
  volunteerId: string;
  points: number;
  reason: string;
  metadata?: Record<string, any>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  criteria: Record<string, any>;
}

export const pointsService = {
  // Add points to a volunteer
  async addPoints(entry: PointsEntry) {
    try {
      // Map interface properties to database column names
      const dbEntry = {
        volunteer_id: entry.volunteerId,
        points: entry.points,
        reason: entry.reason,
        metadata: entry.metadata
      };

      const { data, error } = await supabase
        .from('points')
        .insert([dbEntry])
        .select()
        .single();

      if (error) {
        // Check if the error is due to the table not existing
        if (error.code === '42P01' || // PostgreSQL error code for undefined_table
            error.message?.includes('relation "points" does not exist') ||
            error.message?.includes('Not Found')) {
          
          console.warn('Points table does not exist. Create it using the SQL query provided.');
          
          // Store points in localStorage as a fallback
          try {
            const storageKey = `pending_points_${entry.volunteerId}`;
            const pendingPoints = JSON.parse(localStorage.getItem(storageKey) || '[]');
            pendingPoints.push({
              ...dbEntry,
              created_at: new Date().toISOString()
            });
            localStorage.setItem(storageKey, JSON.stringify(pendingPoints));
            console.log('Points stored locally until table is created');
          } catch (storageError) {
            console.error('Failed to store points locally:', storageError);
          }
          
          // Return a mock response so the UI doesn't break
          return {
            id: 'pending-' + Date.now(),
            volunteer_id: entry.volunteerId,
            points: entry.points,
            reason: entry.reason,
            metadata: entry.metadata,
            created_at: new Date().toISOString()
          };
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error adding points:', error);
      // Return a mock response so the UI doesn't break
      return {
        id: 'error-' + Date.now(),
        volunteer_id: entry.volunteerId,
        points: entry.points,
        reason: entry.reason,
        metadata: entry.metadata,
        created_at: new Date().toISOString()
      };
    }
  },

  // Get total points for a volunteer
  async getVolunteerPoints(volunteerId: string) {
    const { data, error } = await supabase
      .from('points')
      .select('points')
      .eq('volunteer_id', volunteerId);

    if (error) throw error;
    return data.reduce((sum, entry) => sum + entry.points, 0);
  },

  // Get leaderboard - updated to use the new RPC function
  async getLeaderboard(limit = 10) {
    try {
      const { data, error } = await getVolunteerLeaderboard();
      
      if (error) throw error;
      
      // Calculate points for each volunteer with simpler queries
      const leaderboardData = await Promise.all(data.map(async (volunteer) => {
        let totalPoints = 0;
        
        try {
          // Get task completion points - simpler query without foreign references
          const { data: taskPoints } = await supabase
            .from('task_assignment')
            .select('status')
            .eq('volunteer_id', volunteer.id)
            .eq('status', 'completed');
            
          // Award 10 points per completed task
          const taskPointsTotal = (taskPoints?.length || 0) * 10;
          
          // Get event participation - simpler query
          const { data: eventSignups } = await supabase
            .from('event_signup')
            .select('attended')
            .eq('volunteer_id', volunteer.id)
            .eq('attended', true);
            
          // Award 20 points per attended event
          const eventPointsTotal = (eventSignups?.length || 0) * 20;
          
          // Calculate total points
          totalPoints = taskPointsTotal + eventPointsTotal;
          
          // Add badge points if applicable (50 points per badge as a simple estimation)
          if (volunteer.badges && Array.isArray(volunteer.badges)) {
            totalPoints += volunteer.badges.length * 50;
          }
        } catch (err) {
          console.error(`Error calculating points for volunteer ${volunteer.id}:`, err);
        }
        
        return {
          volunteer_id: volunteer.id,
          first_name: volunteer.first_name,
          last_name: volunteer.last_name,
          profile_image: volunteer.profile_image,
          total_points: totalPoints,
          badge_count: volunteer.badges?.length || 0
        };
      }));
      
      // Sort by total points
      leaderboardData.sort((a, b) => b.total_points - a.total_points);
      
      // Add rank
      const rankedData = leaderboardData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      return rankedData.slice(0, limit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Get volunteer rank
  async getVolunteerRank(volunteerId: string) {
    try {
      const { data, error } = await getVolunteerRank(volunteerId);
      
      if (error) throw error;
      
      // Format the data for UI consumption
      return {
        rank: data.rank || 0,
        points: data.points || 0,
        totalHours: data.total_hours || 0,
        eventsAttended: data.events_attended || 0
      };
    } catch (error) {
      console.error('Error fetching volunteer rank:', error);
      return null;
    }
  },

  // Track login
  async trackLogin(volunteerId: string) {
    // Add login tracking entry
    const { error: trackingError } = await supabase
      .from('login_tracking')
      .insert([{ volunteer_id: volunteerId }]);

    if (trackingError) throw trackingError;

    // Count total logins
    const { data: loginCount, error: countError } = await supabase
      .from('login_tracking')
      .select('id', { count: 'exact' })
      .eq('volunteer_id', volunteerId);

    if (countError) throw countError;

    // Check for login-based badges
    const count = loginCount?.length || 0;
    
    if (count === 1) {
      await this.awardBadge(volunteerId, 'first-login');
    } else if (count === 5) {
      await this.awardBadge(volunteerId, 'regular-visitor');
    } else if (count === 10) {
      await this.awardBadge(volunteerId, 'dedicated-volunteer');
    }

    return { loginCount: count };
  },

  // Award a badge to a volunteer
  async awardBadge(volunteerId: string, badgeId: string) {
    const { data: existingBadge, error: checkError } = await supabase
      .from('volunteer_badges')
      .select()
      .eq('volunteer_id', volunteerId)
      .eq('badge_id', badgeId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existingBadge) return existingBadge; // Badge already awarded

    const { data, error } = await supabase
      .from('volunteer_badges')
      .insert([{
        volunteer_id: volunteerId,
        badge_id: badgeId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all badges for a volunteer
  async getVolunteerBadges(volunteerId: string) {
    const { data, error } = await supabase
      .from('volunteer_badges')
      .select(`
        *,
        badge:badges (*)
      `)
      .eq('volunteer_id', volunteerId);

    if (error) throw error;
    return data;
  }
}; 