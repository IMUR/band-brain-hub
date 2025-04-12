import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useOfflineStorage, OfflineItem } from './useOfflineStorage';
import { useSync } from '@/contexts/SyncContext';
import { v4 as uuidv4 } from 'uuid';

type SupabaseQueryOptions<T> = {
  table: string;
  bandId?: string;
  select?: string;
  orderBy?: { column: string; ascending: boolean };
  filter?: { column: string; value: any }[];
  relationTable?: string;
  relationColumn?: string;
};

export function useSupabaseQuery<T extends OfflineItem>(options: SupabaseQueryOptions<T>) {
  const { table, bandId, select = '*', orderBy, filter = [], relationTable, relationColumn } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { isOnline } = useSync();
  const offlineStorage = useOfflineStorage<T>(table);
  
  // Load data based on online/offline status
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let items: T[] = [];
      
      if (isOnline) {
        // Fetch from Supabase when online
        let query = supabase.from(table).select(select);
        
        // Apply band ID filter if provided
        if (bandId) {
          query = query.eq('band_id', bandId);
        }
        
        // Apply additional filters
        filter.forEach(f => {
          query = query.eq(f.column, f.value);
        });
        
        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending });
        }
        
        const { data: supabaseData, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw supabaseError;
        }
        
        items = supabaseData as T[];
        
        // Update local storage for offline use
        for (const item of items) {
          await offlineStorage.save(item);
        }
      } else {
        // Load from offline storage when offline
        items = await offlineStorage.getAll();
        
        // Apply filters manually for offline data
        if (bandId) {
          items = items.filter(item => item.band_id === bandId);
        }
        
        filter.forEach(f => {
          items = items.filter(item => item[f.column] === f.value);
        });
        
        // Apply ordering manually
        if (orderBy) {
          items.sort((a, b) => {
            if (a[orderBy.column] < b[orderBy.column]) {
              return orderBy.ascending ? -1 : 1;
            }
            if (a[orderBy.column] > b[orderBy.column]) {
              return orderBy.ascending ? 1 : -1;
            }
            return 0;
          });
        }
      }
      
      setData(items);
    } catch (err) {
      console.error(`Error loading ${table} data:`, err);
      setError(err as Error);
      
      // Try to load from offline storage as fallback
      try {
        const offlineData = await offlineStorage.getAll();
        
        // Apply filters manually
        let filteredData = offlineData;
        if (bandId) {
          filteredData = filteredData.filter(item => item.band_id === bandId);
        }
        
        filter.forEach(f => {
          filteredData = filteredData.filter(item => item[f.column] === f.value);
        });
        
        setData(filteredData);
      } catch (offlineErr) {
        console.error('Failed to load offline data:', offlineErr);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, table, bandId, select, JSON.stringify(filter), JSON.stringify(orderBy)]);
  
  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Set up real-time subscription when online
  useEffect(() => {
    if (!isOnline || !bandId) return;
    
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: bandId ? `band_id=eq.${bandId}` : undefined
      }, () => {
        // Reload data when changes are detected
        loadData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, table, bandId, loadData]);
  
  // CRUD operations with offline support
  const add = async (item: Omit<T, 'id'>): Promise<T> => {
    // Generate a UUID for the new item
    const id = uuidv4();
    const newItem = { ...item, id } as T;
    
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from(table)
          .insert([newItem])
          .select()
          .single();
        
        if (error) throw error;
        
        const insertedItem = data as T;
        
        // Store in offline storage
        await offlineStorage.save(insertedItem);
        
        // Update local state
        setData(prev => [...prev, insertedItem]);
        
        return insertedItem;
      } catch (err) {
        console.error(`Error adding to ${table}:`, err);
        
        // Fall back to offline mode
        await offlineStorage.save(newItem);
        await offlineStorage.addToSyncQueue('insert', newItem);
        
        // Update local state
        setData(prev => [...prev, newItem]);
        
        return newItem;
      }
    } else {
      // Offline mode - save to local storage and queue for sync
      await offlineStorage.save(newItem);
      await offlineStorage.addToSyncQueue('insert', newItem);
      
      // Update local state
      setData(prev => [...prev, newItem]);
      
      return newItem;
    }
  };
  
  const update = async (id: string, updates: Partial<T>): Promise<void> => {
    if (isOnline) {
      try {
        const { error } = await supabase
          .from(table)
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;
        
        // Get the existing item and update it
        const existingItem = await offlineStorage.get(id);
        if (existingItem) {
          const updatedItem = { ...existingItem, ...updates };
          await offlineStorage.save(updatedItem);
        }
        
        // Update local state
        setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      } catch (err) {
        console.error(`Error updating ${table}:`, err);
        
        // Fall back to offline mode
        const existingItem = await offlineStorage.get(id);
        if (existingItem) {
          const updatedItem = { ...existingItem, ...updates };
          await offlineStorage.save(updatedItem);
          await offlineStorage.addToSyncQueue('update', updatedItem);
          
          // Update local state
          setData(prev => prev.map(item => item.id === id ? updatedItem : item));
        }
      }
    } else {
      // Offline mode - update local storage and queue for sync
      const existingItem = await offlineStorage.get(id);
      if (existingItem) {
        const updatedItem = { ...existingItem, ...updates };
        await offlineStorage.save(updatedItem);
        await offlineStorage.addToSyncQueue('update', updatedItem);
        
        // Update local state
        setData(prev => prev.map(item => item.id === id ? updatedItem : item));
      }
    }
  };
  
  const remove = async (id: string): Promise<void> => {
    if (isOnline) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Remove from offline storage
        await offlineStorage.remove(id);
        
        // Update local state
        setData(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error(`Error deleting from ${table}:`, err);
        
        // Fall back to offline mode
        await offlineStorage.remove(id);
        await offlineStorage.addToSyncQueue('delete', id);
        
        // Update local state
        setData(prev => prev.filter(item => item.id !== id));
      }
    } else {
      // Offline mode - remove from local storage and queue for sync
      await offlineStorage.remove(id);
      await offlineStorage.addToSyncQueue('delete', id);
      
      // Update local state
      setData(prev => prev.filter(item => item.id !== id));
    }
  };
  
  const refresh = () => {
    loadData();
  };
  
  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    refresh
  };
} 