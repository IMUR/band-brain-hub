
import { createClient } from '@supabase/supabase-js';

// Use hardcoded Supabase credentials from the connected project
const supabaseUrl = "https://jdbkcjbgjqnbmznxobjl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYmtjamJnanFuYm16bnhvYmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTY1NTIsImV4cCI6MjA2MDAzMjU1Mn0.yMjafay-ju5UtnApmuQHHZ1Ygw3nQn7PPWVju0YjVeY";

// Create Supabase client with the hardcoded credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
