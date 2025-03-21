import { createClient } from '@supabase/supabase-js';

// Try to use environment variables first, with fallbacks to direct values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://csotbvprygtwbarusbwc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb3RidnByeWd0d2JhcnVzYndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwMzQ4OTEsImV4cCI6MjAyNjYxMDg5MX0.m0JmkJWL9UrH9XMBfafaRHmgwm1lG1o-8rIrIYlvV4Y';

// Create the Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh of the auth token
    autoRefreshToken: true,
    // Whether to persist the session
    persistSession: true,
    // Detect auth session in URL (used for email confirmations)
    detectSessionInUrl: true,
    // Use PKCE flow for better security
    flowType: 'pkce',
  }
}); 