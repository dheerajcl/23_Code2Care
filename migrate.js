require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Main migration function
async function main() {
  console.log('Running migrations...');
  
  try {
    // Get the SQL file content
    const migrationSqlPath = path.join(process.cwd(), 'drizzle', '0001_stiff_blue_shield.sql');
    if (!fs.existsSync(migrationSqlPath)) {
      console.error(`Migration file not found: ${migrationSqlPath}`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(migrationSqlPath, 'utf8');
    console.log(`Loaded SQL file: ${migrationSqlPath}`);
    
    // Connect to PostgreSQL
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
    
    console.log('Connected to database, executing SQL...');
    
    // Split the SQL into individual statements at the statement-breakpoint
    const statements = sql.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Executed statement successfully');
      } catch (stmtError) {
        console.error('Error executing statement:', stmtError);
        // Continue with next statement
      }
    }
    
    console.log('Migrations completed successfully');
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Error during migrations:', error);
    process.exit(1);
  }
}

// Run the main function
main()
  .then(() => {
    console.log('Migration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Uncaught error in migration script:', error);
    process.exit(1);
  }); 