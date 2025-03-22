import { pgTable, text, uuid, timestamp, json, integer, unique } from 'drizzle-orm/pg-core';
import { organizations } from './organization';
import { admins, volunteers } from './users';

// Event table
export const events = pgTable('event', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: text('status').default('upcoming').notNull(),
  adminId: uuid('admin_id').notNull().references(() => admins.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
});

// Task table
export const tasks = pgTable('task', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  skills: json('skills').$type<string[]>().default([]),
  maxVolunteers: integer('max_volunteers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: text('status').default('open').notNull(),
  eventId: uuid('event_id').notNull().references(() => events.id),
});

// Event signup table
export const eventSignups = pgTable('event_signup', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  volunteerId: uuid('volunteer_id').notNull().references(() => volunteers.id),
  eventId: uuid('event_id').notNull().references(() => events.id),
}, (table) => {
  return {
    volunteerEventIdx: unique().on(table.volunteerId, table.eventId)
  };
});

// Task assignment table
export const taskAssignments = pgTable('task_assignment', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').default('assigned').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  volunteerId: uuid('volunteer_id').notNull().references(() => volunteers.id),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
}, (table) => {
  return {
    volunteerTaskIdx: unique().on(table.volunteerId, table.taskId)
  };
});

// Feedback table
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  rating: integer('rating').notNull(),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  volunteerId: uuid('volunteer_id').notNull().references(() => volunteers.id),
  eventId: uuid('event_id').notNull().references(() => events.id),
}, (table) => {
  return {
    volunteerEventFeedbackIdx: unique().on(table.volunteerId, table.eventId)
  };
});

// Newsletter table
export const newsletter = pgTable('newsletter', {
  email: text('email').primaryKey().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define types based on the schema
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type EventSignup = typeof eventSignups.$inferSelect;
export type NewEventSignup = typeof eventSignups.$inferInsert;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type NewTaskAssignment = typeof taskAssignments.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

export type Newsletter = typeof newsletter.$inferSelect;
export type NewNewsletter = typeof newsletter.$inferInsert; 