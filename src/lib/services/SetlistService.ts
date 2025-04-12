import { supabase } from '../supabase';
import { Database } from '@/integrations/supabase/types';

export type Setlist = Database['public']['Tables']['setlists']['Row'];
export type SetlistInsert = Database['public']['Tables']['setlists']['Insert'];
export type SetlistUpdate = Database['public']['Tables']['setlists']['Update'];

export type SetlistSong = Database['public']['Tables']['setlist_songs']['Row'];
export type SetlistSongInsert = Database['public']['Tables']['setlist_songs']['Insert'];
export type SetlistSongUpdate = Database['public']['Tables']['setlist_songs']['Update'];

export class SetlistService {
  static async getSetlists(bandId: string): Promise<Setlist[]> {
    const { data, error } = await supabase
      .from('setlists')
      .select('*')
      .eq('band_id', bandId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createSetlist(setlist: SetlistInsert): Promise<Setlist> {
    const { data, error } = await supabase
      .from('setlists')
      .insert([setlist])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create setlist');
    }
    
    return data;
  }
  
  static async updateSetlist(id: string, updates: SetlistUpdate): Promise<void> {
    const { error } = await supabase
      .from('setlists')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteSetlist(id: string): Promise<void> {
    // First delete all songs in the setlist
    const { error: songsError } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('setlist_id', id);
    
    if (songsError) {
      throw songsError;
    }
    
    // Then delete the setlist
    const { error } = await supabase
      .from('setlists')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async getSetlistSongs(setlistId: string): Promise<SetlistSong[]> {
    const { data, error } = await supabase
      .from('setlist_songs')
      .select('*')
      .eq('setlist_id', setlistId)
      .order('order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createSetlistSong(song: SetlistSongInsert): Promise<SetlistSong> {
    const { data, error } = await supabase
      .from('setlist_songs')
      .insert([song])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create setlist song');
    }
    
    return data;
  }
  
  static async updateSetlistSong(id: string, updates: SetlistSongUpdate): Promise<void> {
    const { error } = await supabase
      .from('setlist_songs')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteSetlistSong(id: string): Promise<void> {
    const { error } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async reorderSetlistSongs(setlistId: string, songIds: string[]): Promise<void> {
    // Update each song with its new order
    const updates = songIds.map((id, index) => ({
      id,
      order: index + 1
    }));
    
    for (const update of updates) {
      const { error } = await supabase
        .from('setlist_songs')
        .update({ order: update.order })
        .eq('id', update.id)
        .eq('setlist_id', setlistId);
      
      if (error) {
        throw error;
      }
    }
  }
  
  // Subscribe to real-time changes for setlists
  static subscribeToSetlists(bandId: string, callback: (payload: any) => void) {
    return supabase
      .channel('setlists-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'setlists',
        filter: `band_id=eq.${bandId}`
      }, callback)
      .subscribe();
  }
  
  // Subscribe to real-time changes for setlist songs
  static subscribeToSetlistSongs(setlistId: string, callback: (payload: any) => void) {
    return supabase
      .channel('setlist-songs-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'setlist_songs',
        filter: `setlist_id=eq.${setlistId}`
      }, callback)
      .subscribe();
  }
} 