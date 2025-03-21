-- Initialize the database with all required tables

-- Organization table
CREATE TABLE IF NOT EXISTS "organization" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "logo" TEXT,
  "mission" TEXT,
  "website" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Admin table
CREATE TABLE IF NOT EXISTS "admin" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "organization_id" UUID REFERENCES "organization" ("id")
);

-- Volunteer table
CREATE TABLE IF NOT EXISTS "volunteer" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "skills" JSONB DEFAULT '[]'::jsonb,
  "interests" JSONB DEFAULT '[]'::jsonb,
  "availability" TEXT,
  "experience" TEXT,
  "how_heard" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Event table
CREATE TABLE IF NOT EXISTS "event" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "admin_id" UUID NOT NULL REFERENCES "admin" ("id"),
  "organization_id" UUID NOT NULL REFERENCES "organization" ("id")
);

-- Task table
CREATE TABLE IF NOT EXISTS "task" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "start_time" TIMESTAMP,
  "end_time" TIMESTAMP,
  "skills" JSONB DEFAULT '[]'::jsonb,
  "max_volunteers" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "status" TEXT NOT NULL DEFAULT 'open',
  "event_id" UUID NOT NULL REFERENCES "event" ("id")
);

-- Event signup table
CREATE TABLE IF NOT EXISTS "event_signup" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "volunteer_id" UUID NOT NULL REFERENCES "volunteer" ("id"),
  "event_id" UUID NOT NULL REFERENCES "event" ("id"),
  CONSTRAINT "volunteer_event_unique" UNIQUE ("volunteer_id", "event_id")
);

-- Task assignment table
CREATE TABLE IF NOT EXISTS "task_assignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status" TEXT NOT NULL DEFAULT 'assigned',
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "volunteer_id" UUID NOT NULL REFERENCES "volunteer" ("id"),
  "task_id" UUID NOT NULL REFERENCES "task" ("id"),
  CONSTRAINT "volunteer_task_unique" UNIQUE ("volunteer_id", "task_id")
);

-- Feedback table
CREATE TABLE IF NOT EXISTS "feedback" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rating" INTEGER NOT NULL,
  "comments" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "volunteer_id" UUID NOT NULL REFERENCES "volunteer" ("id"),
  "event_id" UUID NOT NULL REFERENCES "event" ("id"),
  CONSTRAINT "volunteer_event_feedback_unique" UNIQUE ("volunteer_id", "event_id")
);

-- Newsletter table
CREATE TABLE IF NOT EXISTS "newsletter" (
  "email" TEXT PRIMARY KEY NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
); 