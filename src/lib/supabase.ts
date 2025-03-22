import { createClient } from '@supabase/supabase-js';

// Try to use environment variables first, with fallbacks to direct values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://csotbvprygtwbarusbwc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb3RidnByeWd0d2JhcnVzYndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTM2NTcsImV4cCI6MjA1ODEyOTY1N30.A2RfgEHP1kvLhMOyajRKfdr7rIj53w6qykddQl0-j3A';

// Create a simple test function to verify database connection
export const testDatabaseConnection = async () => {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/volunteer?select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Database connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
};

// Create the Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh of the auth token
    autoRefreshToken: true,
    // Whether to persist the session
    persistSession: true,
    // Disable everything related to email confirmation
    detectSessionInUrl: false,
    // Use PKCE flow for better security
    flowType: 'pkce',
  },
  global: {
    // Increase timeout to 20 seconds
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 20000, // 20 seconds
  },
}); 