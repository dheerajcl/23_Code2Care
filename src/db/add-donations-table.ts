import { sql } from 'drizzle-orm';
import { pgTable, text, uuid, timestamp, json, numeric, boolean } from 'drizzle-orm/pg-core';

export async function up(db) {
  await db.schema.createTable('donation')
    .addColumn('id', uuid('id').primaryKey().defaultRandom())
    .addColumn('amount', numeric('amount').notNull())
    .addColumn('donation_type', text('donation_type').notNull())
    .addColumn('donation_purpose', text('donation_purpose').notNull())
    .addColumn('payment_method', text('payment_method').notNull())
    .addColumn('payment_status', text('payment_status').default('pending').notNull())
    .addColumn('transaction_id', text('transaction_id'))
    .addColumn('donor_name', text('donor_name').notNull())
    .addColumn('donor_email', text('donor_email').notNull())
    .addColumn('donor_phone', text('donor_phone').notNull())
    .addColumn('donor_address', text('donor_address'))
    .addColumn('pan_number', text('pan_number'))
    .addColumn('donor_message', text('donor_message'))
    .addColumn('receive_updates', boolean('receive_updates').default(false))
    .addColumn('created_at', timestamp('created_at').defaultNow().notNull())
    .addColumn('updated_at', timestamp('updated_at').defaultNow().notNull())
    .addColumn('organization_id', uuid('organization_id'))
    .execute();
  
  // Add foreign key constraint
  await db.execute(
    sql`ALTER TABLE "donation" ADD CONSTRAINT "donation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL`
  );
}

export async function down(db) {
  await db.schema.dropTable('donation').execute();
}