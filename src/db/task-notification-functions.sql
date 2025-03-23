-- Function to get counts of task assignments by notification status
CREATE OR REPLACE FUNCTION get_task_assignment_status_counts()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'pending', COALESCE((SELECT COUNT(*) FROM task_assignment WHERE notification_status = 'pending'), 0),
    'sent', COALESCE((SELECT COUNT(*) FROM task_assignment WHERE notification_status = 'sent'), 0),
    'accept', COALESCE((SELECT COUNT(*) FROM task_assignment WHERE notification_status = 'accept'), 0),
    'reject', COALESCE((SELECT COUNT(*) FROM task_assignment WHERE notification_status = 'reject'), 0),
    'expired', COALESCE((SELECT COUNT(*) FROM task_assignment WHERE notification_status = 'expired'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_task_assignment_status_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_assignment_status_counts() TO service_role;

-- Function to automatically expire task assignments after 24 hours
CREATE OR REPLACE FUNCTION auto_expire_task_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- Find and update task assignments that were sent over 24 hours ago and haven't been responded to
  UPDATE task_assignment
  SET 
    notification_status = 'expired',
    status = 'rejected'
  WHERE 
    notification_status = 'sent' AND 
    notification_sent_at < NOW() - INTERVAL '24 hours' AND
    notification_responded_at IS NULL;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the auto expire function periodically
DROP TRIGGER IF EXISTS trigger_auto_expire_task_assignments ON task_assignment;

CREATE TRIGGER trigger_auto_expire_task_assignments
AFTER INSERT OR UPDATE ON task_assignment
FOR EACH STATEMENT
EXECUTE FUNCTION auto_expire_task_assignments();

-- Cron job to run every hour to check for expired assignments
-- Note: This would require the pg_cron extension to be enabled
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- SELECT cron.schedule('expire_task_assignments', '0 * * * *', 'SELECT auto_expire_task_assignments()'); 