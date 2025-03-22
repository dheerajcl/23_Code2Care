/**
 * Database connection verification script
 * This script tests the database connection and queries the admin and volunteer tables
 * Run with: npx tsx src/db/verify-connection.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

async function main() {
  console.log('Testing database connection...');
  
  try {
    // Create a connection pool
    const pool = new Pool({
      host: 'db.csotbvprygtwbarusbwc.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'samarthanam24',
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Test the connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');

    // Create Drizzle instance
    const db = drizzle(pool, { schema });

    // Query admins
    console.log('\nQuerying admins table...');
    const admins = await db.query.admins.findMany();
    console.log(`Found ${admins.length} admin(s):`);
    admins.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (${admin.email})`);
    });

    // Query volunteers
    console.log('\nQuerying volunteers table...');
    const volunteers = await db.query.volunteers.findMany();
    console.log(`Found ${volunteers.length} volunteer(s):`);
    volunteers.forEach(volunteer => {
      console.log(`- ${volunteer.firstName} ${volunteer.lastName} (${volunteer.email})`);
    });

    // Release the client back to the pool
    client.release();
    await pool.end();
    
    console.log('\n✅ Database verification completed successfully!');
  } catch (error) {
    console.error('❌ Database connection or query failed:');
    console.error(error);
    process.exit(1);
  }
}

main(); 