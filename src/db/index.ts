import * as schema from './schema';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a type for our database interface
// This will be properly typed in a real implementation
type DrizzleDatabase = any;

let db: DrizzleDatabase;

if (isBrowser) {
  // In browser, create a dummy db that throws errors when methods are called
  db = new Proxy({} as DrizzleDatabase, {
    get(target, prop) {
      // Handle special cases to avoid breaking certain JavaScript behaviors
      if (prop === 'then' || prop === 'catch') {
        return undefined;
      }
      
      // For everything else, return a function that throws an error
      return () => {
        throw new Error(
          `Database operations cannot be performed in the browser. ` +
          `Attempted to access db.${String(prop)}()`
        );
      };
    }
  });
} else {
  // Server-side code - we need to dynamically import modules
  // that shouldn't be included in the client bundle
  try {
    // Using require to prevent bundlers from including this in client code
    // @ts-ignore - Dynamic require
    const { drizzle } = require('drizzle-orm/node-postgres');
    // @ts-ignore - Dynamic require
    const { Pool } = require('pg');
    
    const pool = new Pool({
      host: 'db.csotbvprygtwbarusbwc.supabase.co',
      port: 5432,
      user: 'postgres',
      password: 'samarthanam24',
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    db = drizzle(pool, { schema });
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    // Provide a dummy implementation that won't crash
    db = {} as DrizzleDatabase;
  }
}

export { db }; 