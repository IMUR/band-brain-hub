import { useState, useEffect } from 'react';

// Initialize the database
const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BandBrainHubDB', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores for each data type
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('budget_items')) {
        db.createObjectStore('budget_items', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('setlists')) {
        db.createObjectStore('setlists', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('setlist_songs')) {
        db.createObjectStore('setlist_songs', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Generic interface for all data types
export interface OfflineItem {
  id: string;
  [key: string]: any;
}

// Queue item for synchronization
export interface SyncQueueItem {
  id?: number;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  item: OfflineItem | string; // Full item for insert/update, just id for delete
  timestamp: number;
}

export const useOfflineStorage = <T extends OfflineItem>(storeName: string) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Set up the database and online/offline listeners
  useEffect(() => {
    const setupDB = async () => {
      try {
        const database = await initDB();
        setDb(database);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };
    
    setupDB();
    
    // Set up online/offline status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Get all items from the store
  const getAll = async (): Promise<T[]> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(`Error getting all from ${storeName}`);
      };
    });
  };
  
  // Get a single item by ID
  const get = async (id: string): Promise<T | null> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(`Error getting id ${id} from ${storeName}`);
      };
    });
  };
  
  // Save an item
  const save = async (item: T): Promise<T> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = () => {
        reject(`Error saving to ${storeName}`);
      };
    });
  };
  
  // Delete an item
  const remove = async (id: string): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(`Error deleting from ${storeName}`);
      };
    });
  };
  
  // Add an item to the sync queue
  const addToSyncQueue = async (operation: 'insert' | 'update' | 'delete', item: T | string): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const queueItem: SyncQueueItem = {
      table: storeName,
      operation,
      item,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(queueItem);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(`Error adding to sync queue`);
      };
    });
  };
  
  // Get the sync queue
  const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(`Error getting sync queue`);
      };
    });
  };
  
  // Remove an item from the sync queue
  const removeFromSyncQueue = async (id: number): Promise<void> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(`Error removing from sync queue`);
      };
    });
  };
  
  return {
    isOnline,
    getAll,
    get,
    save,
    remove,
    addToSyncQueue,
    getSyncQueue,
    removeFromSyncQueue
  };
}; 