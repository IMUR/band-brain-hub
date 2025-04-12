import { supabase } from '../supabase';
import { Database } from '@/integrations/supabase/types';

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export class EventService {
  static async getEvents(bandId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('band_id', bandId)
      .order('start_date', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createEvent(event: EventInsert): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create event');
    }
    
    return data;
  }
  
  static async updateEvent(id: string, updates: EventUpdate): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  // Subscribe to real-time changes
  static subscribeToEvents(bandId: string, callback: (payload: any) => void) {
    return supabase
      .channel('events-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `band_id=eq.${bandId}`
      }, callback)
      .subscribe();
  }
} 