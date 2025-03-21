/**
 * This script checks if the required database tables exist in Supabase
 * Run it with: npx tsx src/lib/check-tables.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read values from .env file
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract the SUPABASE_URL and SUPABASE_ANON_KEY
const extractEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}="(.*)"`));
  return match ? match[1] : null;
};

const supabaseUrl = extractEnvValue('VITE_SUPABASE_URL');
const supabaseAnonKey = extractEnvValue('VITE_SUPABASE_ANON_KEY');

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.substr(-5) : 'Not found');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('--------------------------------------');
console.log('ACTION REQUIRED:');
console.log('1. Go to your Supabase dashboard: https://app.supabase.com/');
console.log('2. Select your project');
console.log('3. Go to SQL Editor');
console.log('4. Run the SQL from create-tables.sql file');
console.log('--------------------------------------');
console.log('This will grant the necessary permissions without providing excessive privileges.');
console.log('You need to fix the permissions before proceeding with development.');
console.log('--------------------------------------');

async function checkTables() {
  console.log('Checking if tables exist in the database...');
  
  let hasPermissionIssue = false;
  
  try {
    // Check if admin table exists
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Admin table not found or inaccessible:', adminError.message);
      console.error('Error details:', adminError);
      
      if (adminError.message.includes('permission denied')) {
        hasPermissionIssue = true;
      }
    } else {
      console.log('✅ Admin table exists and is accessible');
      console.log('Admin data sample:', adminData);
    }
    
    // Check if volunteer table exists
    const { data: volunteerData, error: volunteerError } = await supabase
      .from('volunteer')
      .select('*')
      .limit(1);
    
    if (volunteerError) {
      console.error('❌ Volunteer table not found or inaccessible:', volunteerError.message);
      console.error('Error details:', volunteerError);
      
      if (volunteerError.message.includes('permission denied')) {
        hasPermissionIssue = true;
      }
    } else {
      console.log('✅ Volunteer table exists and is accessible');
      console.log('Volunteer data sample:', volunteerData);
    }
    
    // Check if organization table exists
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('*')
      .limit(1);
    
    if (orgError) {
      console.error('❌ Organization table not found or inaccessible:', orgError.message);
      console.error('Error details:', orgError);
      
      if (orgError.message.includes('permission denied')) {
        hasPermissionIssue = true;
      }
    } else {
      console.log('✅ Organization table exists and is accessible');
      console.log('Organization data sample:', orgData);
    }
    
    if (hasPermissionIssue) {
      console.log('\n--------------------------------------');
      console.log('PERMISSION ISSUE DETECTED!');
      console.log('Please run the SQL commands in create-tables.sql to fix this issue.');
      console.log('--------------------------------------');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables(); 