import { createClient } from '@supabase/supabase-js';

// Use Vite's environment variables instead of dotenv
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://csotbvprygtwbarusbwc.supabase.co';
const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb3RidnByeWd0d2JhcnVzYndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTM2NTcsImV4cCI6MjA1ODEyOTY1N30.A2RfgEHP1kvLhMOyajRKfdr7rIj53w6qykddQl0-j3A';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }; 