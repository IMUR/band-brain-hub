
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with fallback empty strings to prevent runtime errors
// Note: The client won't work properly until valid credentials are provided
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          location: string;
          type: 'gig' | 'rehearsal' | 'other';
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          location?: string;
          type: 'gig' | 'rehearsal' | 'other';
          created_at?: string;
          user_id: string;
        };
        Update: {
          title?: string;
          date?: string;
          location?: string;
          type?: 'gig' | 'rehearsal' | 'other';
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          assignee: string;
          completed: boolean;
          due_date: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          assignee?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          title?: string;
          assignee?: string;
          completed?: boolean;
          due_date?: string | null;
        };
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          author: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_at?: string;
          author?: string;
          user_id: string;
        };
        Update: {
          title?: string;
          content?: string;
          author?: string;
        };
      };
    };
  };
};
