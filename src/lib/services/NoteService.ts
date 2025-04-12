import { supabase } from '../supabase';
import { Database } from '@/integrations/supabase/types';

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export class NoteService {
  static async getNotes(bandId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('band_id', bandId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createNote(note: NoteInsert): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create note');
    }
    
    return data;
  }
  
  static async updateNote(id: string, updates: NoteUpdate): Promise<void> {
    // Include updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('notes')
      .update(updatesWithTimestamp)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  // Subscribe to real-time changes
  static subscribeToNotes(bandId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notes-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `band_id=eq.${bandId}`
      }, callback)
      .subscribe();
  }
} 