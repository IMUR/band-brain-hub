import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useOfflineStorage, SyncQueueItem } from './useOfflineStorage';
import { useToast } from '@/components/ui/use-toast';

// Interval in milliseconds for sync attempts
const SYNC_INTERVAL = 30000; // 30 seconds

export const useSyncManager = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncQueueStorage = useOfflineStorage<SyncQueueItem>('sync_queue');
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Try to sync when we come back online
      sync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Set up interval for sync attempts
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && !isSyncing) {
        sync();
      }
    }, SYNC_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isOnline, isSyncing]);
  
  // Main sync function
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      // Get all items from the sync queue
      const queueItems = await syncQueueStorage.getSyncQueue();
      
      if (queueItems.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      // Process queue items in order
      for (const item of queueItems) {
        if (!item.id) continue;
        
        try {
          switch (item.operation) {
            case 'insert':
              if (typeof item.item !== 'string') {
                await supabase
                  .from(item.table)
                  .insert([item.item]);
              }
              break;
              
            case 'update':
              if (typeof item.item !== 'string') {
                await supabase
                  .from(item.table)
                  .update(item.item)
                  .eq('id', item.item.id);
              }
              break;
              
            case 'delete':
              if (typeof item.item === 'string') {
                await supabase
                  .from(item.table)
                  .delete()
                  .eq('id', item.item);
              }
              break;
          }
          
          // Remove from queue after successful processing
          await syncQueueStorage.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Error processing sync item ${item.id}:`, error);
          // We'll continue with the next item
        }
      }
      
      setLastSyncTime(new Date());
      toast({
        title: "Sync completed",
        description: `Successfully synchronized ${queueItems.length} items`
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Failed to synchronize your data"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);
  
  // Force a sync
  const forceSync = useCallback(() => {
    if (isOnline) {
      sync();
    } else {
      toast({
        variant: "destructive",
        title: "Offline",
        description: "Cannot sync while offline"
      });
    }
  }, [isOnline]);
  
  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    forceSync
  };
}; 