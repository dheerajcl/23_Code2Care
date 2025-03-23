-- Create a function to generate volunteer leaderboard
CREATE OR REPLACE FUNCTION get_volunteer_leaderboard()
RETURNS TABLE (
  id UUID,
  rank BIGINT,
  first_name TEXT,
  last_name TEXT,
  profile_image TEXT,
  total_hours NUMERIC,
  events_attended INTEGER,
  badges JSONB,
  points INTEGER,
  score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH volunteer_stats AS (
    -- Calculate statistics for each volunteer
    SELECT 
      v.id,
      v.first_name,
      v.last_name,
      v.profile_image,
      COALESCE(SUM(es.hours), 0) AS total_hours,
      COUNT(DISTINCT es.event_id) AS events_attended,
      v.badges,
      -- Calculate completed tasks
      (
        SELECT COUNT(*)
        FROM task_assignment ta
        WHERE ta.volunteer_id = v.id AND ta.status = 'completed'
      ) AS completed_tasks,
      -- Points calculation based on hours, events, and badges
      (
        COALESCE((
          SELECT COUNT(*)
          FROM task_assignment ta
          WHERE ta.volunteer_id = v.id AND ta.status = 'completed'
        ), 0) * 10 +
        COUNT(DISTINCT es.event_id) * 20 +
        COALESCE(JSONB_ARRAY_LENGTH(v.badges), 0) * 50
      ) AS points
    FROM 
      volunteer v
    LEFT JOIN 
      event_signup es ON v.id = es.volunteer_id AND es.attended = true
    GROUP BY 
      v.id
  )
  SELECT 
    vs.id,
    ROW_NUMBER() OVER (ORDER BY vs.points DESC, vs.total_hours DESC) AS rank,
    vs.first_name,
    vs.last_name,
    vs.profile_image,
    vs.total_hours,
    vs.events_attended,
    vs.badges,
    vs.points,
    -- Calculate score (0-100) based on ranking
    CASE 
      WHEN MAX(vs.points) OVER () = 0 THEN 0
      ELSE 100 * vs.points / MAX(vs.points) OVER ()
    END AS score
  FROM 
    volunteer_stats vs
  ORDER BY 
    rank ASC;
END;
$$;

-- Grant access to the function for authenticated users
GRANT EXECUTE ON FUNCTION get_volunteer_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_volunteer_leaderboard() TO anon;

-- Create a function to get a specific volunteer's rank and statistics
CREATE OR REPLACE FUNCTION get_volunteer_rank(volunteer_id UUID)
RETURNS TABLE (
  id UUID,
  rank BIGINT,
  first_name TEXT,
  last_name TEXT,
  profile_image TEXT,
  total_hours NUMERIC,
  events_attended INTEGER,
  badges JSONB,
  points INTEGER,
  score NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT vl.* FROM get_volunteer_leaderboard() vl
  WHERE vl.id = volunteer_id;
END;
$$;

-- Grant access to the function for authenticated users
GRANT EXECUTE ON FUNCTION get_volunteer_rank(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_volunteer_rank(UUID) TO anon; 