import { pgTable, text, uuid, timestamp, json, foreignKey } from 'drizzle-orm/pg-core';
import { organizations } from './organization';

// Admin table
export const admins = pgTable('admin', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
});

// Volunteer table
export const volunteers = pgTable('volunteer', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  skills: json('skills').$type<string[]>().default([]),
  interests: json('interests').$type<string[]>().default([]),
  availability: text('availability'),
  experience: text('experience'),
  howHeard: text('how_heard'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define types based on the schema
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Volunteer = typeof volunteers.$inferSelect;
export type NewVolunteer = typeof volunteers.$inferInsert; 