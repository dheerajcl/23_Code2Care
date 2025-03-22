import { pgTable, uuid, varchar, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { volunteers } from './users';

export const points = pgTable('points', {
  id: uuid('id').defaultRandom().primaryKey(),
  volunteerId: uuid('volunteer_id').references(() => volunteers.id),
  points: integer('points').notNull().default(0),
  reason: varchar('reason').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  description: varchar('description').notNull(),
  icon: varchar('icon').notNull(),
  points: integer('points').notNull().default(0),
  criteria: jsonb('criteria').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const volunteerBadges = pgTable('volunteer_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  volunteerId: uuid('volunteer_id').references(() => volunteers.id),
  badgeId: uuid('badge_id').references(() => badges.id),
  earnedAt: timestamp('earned_at').defaultNow(),
});

export const loginTracking = pgTable('login_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  volunteerId: uuid('volunteer_id').references(() => volunteers.id),
  loginAt: timestamp('login_at').defaultNow(),
}); 