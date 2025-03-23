import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'db.csotbvprygtwbarusbwc.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '8WOFxFmBg2rYuGEK',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  },
}); 