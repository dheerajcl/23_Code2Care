import { pgTable, text, uuid, timestamp, json, numeric, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './organization';
import { admins } from './users';

// Donation table
export const donations = pgTable('donation', {
  id: uuid('id').primaryKey().defaultRandom(),
  amount: numeric('amount').notNull(),
  donationType: text('donation_type').notNull(), // oneTime or monthly
  donationPurpose: text('donation_purpose').notNull(), // education, skill, livelihood, sports, cultural, general
  paymentMethod: text('payment_method').notNull(), // card, upi, netbanking
  paymentStatus: text('payment_status').default('pending').notNull(), // pending, completed, failed
  transactionId: text('transaction_id'),
  
  // Donor information
  donorName: text('donor_name').notNull(),
  donorEmail: text('donor_email').notNull(),
  donorPhone: text('donor_phone').notNull(),
  donorAddress: text('donor_address'),
  panNumber: text('pan_number'),
  donorMessage: text('donor_message'),
  
  // Consent and preferences
  receiveUpdates: boolean('receive_updates').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // References
  organizationId: uuid('organization_id').references(() => organizations.id),
});

// Define types based on the schema
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;