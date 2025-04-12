import React, { createContext, useContext, useEffect } from 'react';
import { useSyncManager } from '@/hooks/useSyncManager';

type SyncContextType = {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  forceSync: () => void;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSyncing, isOnline, lastSyncTime, forceSync } = useSyncManager();
  
  // Try to sync when the application loads
  useEffect(() => {
    if (isOnline) {
      forceSync();
    }
  }, []);
  
  return (
    <SyncContext.Provider value={{
      isSyncing,
      isOnline,
      lastSyncTime,
      forceSync
    }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}; 