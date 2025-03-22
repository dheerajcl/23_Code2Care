CREATE OR REPLACE FUNCTION get_volunteer_leaderboard(limit_count integer)
RETURNS TABLE (
  volunteer_id uuid,
  first_name text,
  last_name text,
  total_points bigint,
  badge_count bigint,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH volunteer_points AS (
    SELECT 
      v.id as volunteer_id,
      v.first_name,
      v.last_name,
      COALESCE(SUM(p.points), 0) as total_points,
      COUNT(DISTINCT vb.badge_id) as badge_count
    FROM volunteer v
    LEFT JOIN points p ON v.id = p.volunteer_id
    LEFT JOIN volunteer_badges vb ON v.id = vb.volunteer_id
    GROUP BY v.id, v.first_name, v.last_name
  )
  SELECT 
    vp.*,
    RANK() OVER (ORDER BY vp.total_points DESC, vp.badge_count DESC) as rank
  FROM volunteer_points vp
  ORDER BY total_points DESC, badge_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 