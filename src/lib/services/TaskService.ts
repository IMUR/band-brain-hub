import { supabase } from '../supabase';
import { Database } from '@/integrations/supabase/types';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export class TaskService {
  static async getTasks(bandId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('band_id', bandId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createTask(task: TaskInsert): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create task');
    }
    
    return data;
  }
  
  static async updateTask(id: string, updates: TaskUpdate): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  // Subscribe to real-time changes
  static subscribeToTasks(bandId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `band_id=eq.${bandId}`
      }, callback)
      .subscribe();
  }
} 