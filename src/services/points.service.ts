import { supabase } from '@/lib/supabase';

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
    const { data, error } = await supabase
      .from('points')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data;
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

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .rpc('get_volunteer_leaderboard', { limit_count: limit });

    if (error) throw error;
    return data;
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