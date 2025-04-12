import { supabase } from '../supabase';
import { Database } from '@/integrations/supabase/types';

export type BudgetItem = Database['public']['Tables']['budget_items']['Row'];
export type BudgetItemInsert = Database['public']['Tables']['budget_items']['Insert'];
export type BudgetItemUpdate = Database['public']['Tables']['budget_items']['Update'];

export class BudgetService {
  static async getBudgetItems(bandId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('band_id', bandId)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  }
  
  static async createBudgetItem(item: BudgetItemInsert): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create budget item');
    }
    
    return data;
  }
  
  static async updateBudgetItem(id: string, updates: BudgetItemUpdate): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  static async deleteBudgetItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
  
  // Subscribe to real-time changes
  static subscribeToBudgetItems(bandId: string, callback: (payload: any) => void) {
    return supabase
      .channel('budget-items-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budget_items',
        filter: `band_id=eq.${bandId}`
      }, callback)
      .subscribe();
  }
} 