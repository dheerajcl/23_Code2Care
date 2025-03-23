-- Add notification status and timestamp fields to task_assignment table
ALTER TABLE task_assignment ADD COLUMN IF NOT EXISTS notification_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE task_assignment ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;
ALTER TABLE task_assignment ADD COLUMN IF NOT EXISTS notification_responded_at TIMESTAMPTZ;
ALTER TABLE task_assignment ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMPTZ;

-- Create a function to set response deadline to 24 hours after notification
CREATE OR REPLACE FUNCTION set_response_deadline()
RETURNS TRIGGER AS $$
BEGIN
  NEW.response_deadline := NEW.notification_sent_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set the response deadline
CREATE OR REPLACE TRIGGER set_task_response_deadline
BEFORE UPDATE ON task_assignment
FOR EACH ROW
WHEN (OLD.notification_sent_at IS NULL AND NEW.notification_sent_at IS NOT NULL)
EXECUTE FUNCTION set_response_deadline();

-- Create notification table to store all notifications
CREATE TABLE IF NOT EXISTS notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES volunteer(id),
  task_assignment_id UUID REFERENCES task_assignment(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_volunteer
    FOREIGN KEY(recipient_id)
    REFERENCES volunteer(id)
);

-- Create a function to automatically reject tasks after 24 hours
CREATE OR REPLACE FUNCTION auto_reject_expired_tasks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE task_assignment
  SET status = 'rejected', notification_status = 'expired'
  WHERE notification_status = 'pending'
    AND response_deadline < NOW();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs periodically to check for expired tasks
CREATE OR REPLACE FUNCTION create_auto_reject_trigger()
RETURNS VOID AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('create_auto_reject_trigger'));
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_event_trigger WHERE evtname = 'auto_reject_expired_tasks_trigger'
  ) THEN
    CREATE TRIGGER auto_reject_expired_tasks_trigger
    AFTER INSERT OR UPDATE ON task_assignment
    EXECUTE FUNCTION auto_reject_expired_tasks();
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_auto_reject_trigger(); 