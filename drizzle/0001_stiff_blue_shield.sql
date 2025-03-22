CREATE TABLE "event_signup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "event_signup_volunteer_id_event_id_unique" UNIQUE("volunteer_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"admin_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"category" text
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rating" integer NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "feedback_volunteer_id_event_id_unique" UNIQUE("volunteer_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "newsletter" (
	"email" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"volunteer_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	CONSTRAINT "task_assignment_volunteer_id_task_id_unique" UNIQUE("volunteer_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp,
	"end_time" timestamp,
	"skills" json DEFAULT '[]'::json,
	"max_volunteers" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"event_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volunteer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"skills" json DEFAULT '[]'::json,
	"interests" json DEFAULT '[]'::json,
	"availability" text,
	"experience" text,
	"how_heard" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"mission" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DROP TABLE "admin_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
DROP TABLE "volunteer_profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "event_signup" ADD CONSTRAINT "event_signup_volunteer_id_volunteer_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_signup" ADD CONSTRAINT "event_signup_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_volunteer_id_volunteer_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_volunteer_id_volunteer_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;