import { createClient } from '@supabase/supabase-js';

// Use Vite's environment variables instead of dotenv
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://csotbvprygtwbarusbwc.supabase.co';
const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzb3RidnByeWd0d2JhcnVzYndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTM2NTcsImV4cCI6MjA1ODEyOTY1N30.A2RfgEHP1kvLhMOyajRKfdr7rIj53w6qykddQl0-j3A';

// Enhanced error handling for Supabase client fetch
const customFetch = (url: RequestInfo, options?: RequestInit) => {
  const timeout = 20000; // 20 seconds

  const controller = new AbortController();
  const { signal } = controller;

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Create options with signal
  const fetchOptions = {
    ...options,
    signal,
  };

  return fetch(url, fetchOptions)
    .then((response) => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      // Improve error message for timeout
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    });
};

// Create Supabase client with enhanced fetch
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: customFetch,
  },
});

// Helper types
export type Admin = {
  id: string;
  email: string;
  first_name: string; 
  last_name: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
};

export type Volunteer = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  experience?: string;
  how_heard?: string;
  created_at?: string;
  updated_at?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_id: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
  status?: string;
  max_volunteers?: number;
};

// Export the client
export { supabase }; 