import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

// Organization table
export const organizations = pgTable('organization', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  logo: text('logo'),
  mission: text('mission'),
  website: text('website'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define types based on the schema
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert; 