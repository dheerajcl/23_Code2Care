-- Volunteer tables for Samarthanam Trust Volunteer Management System

-- Volunteer table
CREATE TABLE IF NOT EXISTS volunteer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    availability TEXT,
    experience TEXT,
    how_heard TEXT,
    status TEXT DEFAULT 'active',
    rating SMALLINT,
    profile_image TEXT,
    badges TEXT[] DEFAULT '{}',
    bio TEXT,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event signup table to track volunteer event registrations
CREATE TABLE IF NOT EXISTS event_signup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteer(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT FALSE,
    hours NUMERIC(5,2) DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, volunteer_id)
);

-- Task assignment table to track tasks assigned to volunteers
CREATE TABLE IF NOT EXISTS task_assignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteer(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned',
    UNIQUE(task_id, volunteer_id)
);

-- Task feedback table to store volunteer feedback on tasks
CREATE TABLE IF NOT EXISTS task_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteer(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event feedback table to store volunteer feedback on events
CREATE TABLE IF NOT EXISTS event_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteer(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_signup_volunteer_id ON event_signup(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_event_signup_event_id ON event_signup(event_id);
CREATE INDEX IF NOT EXISTS idx_task_assignment_volunteer_id ON task_assignment(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_task_assignment_task_id ON task_assignment(task_id);

-- Create a view to easily see volunteers with their event counts
CREATE OR REPLACE VIEW volunteer_event_stats AS
SELECT 
    v.id,
    v.email,
    v.first_name,
    v.last_name,
    COUNT(DISTINCT es.event_id) AS event_count,
    SUM(es.hours) AS total_hours,
    COUNT(DISTINCT CASE WHEN e.category IS NOT NULL THEN e.category END) AS event_category_count,
    ARRAY_AGG(DISTINCT e.category) FILTER (WHERE e.category IS NOT NULL) AS event_categories,
    MAX(es.created_at) AS last_registration_date
FROM 
    volunteer v
LEFT JOIN 
    event_signup es ON v.id = es.volunteer_id
LEFT JOIN 
    event e ON es.event_id = e.id
GROUP BY 
    v.id, v.email, v.first_name, v.last_name;

-- Create RLS policies for volunteer data security
ALTER TABLE volunteer ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signup ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;

-- Admin can see all data
CREATE POLICY admin_all_volunteer ON volunteer TO authenticated USING (
    auth.uid() IN (SELECT id FROM admin)
);

-- Volunteers can only see their own data
CREATE POLICY volunteer_own_data ON volunteer TO authenticated USING (
    auth.uid() = id
);

-- Event signup policies
CREATE POLICY admin_all_signups ON event_signup TO authenticated USING (
    auth.uid() IN (SELECT id FROM admin)
);

CREATE POLICY volunteer_own_signups ON event_signup TO authenticated USING (
    auth.uid() = volunteer_id
);

-- Storage bucket for volunteer profile images
-- Note: Run this in SQL Editor if needed
-- INSERT INTO storage.buckets (id, name, public) VALUES ('volunteer_profiles', 'volunteer_profiles', true); 