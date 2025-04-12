
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded Supabase credentials from the connected project
const supabaseUrl = "https://jdbkcjbgjqnbmznxobjl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYmtjamJnanFuYm16bnhvYmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTY1NTIsImV4cCI6MjA2MDAzMjU1Mn0.yMjafay-ju5UtnApmuQHHZ1Ygw3nQn7PPWVju0YjVeY";

// Create Supabase client with explicit auth config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export type { Database };
