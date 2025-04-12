import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSync } from '@/contexts/SyncContext';
import { LogOut, User, RefreshCw, CloudOff, CheckCircle2 } from 'lucide-react';
import BandSelector from './BandSelector';

const Header = () => {
  const { user, signOut } = useAuth();
  const { isOnline, isSyncing, lastSyncTime, forceSync } = useSync();
  
  const formatSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    // Format the last sync time
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(lastSyncTime);
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-band-green font-bold">🎸 Band Brain Hub</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <BandSelector />
          
          {/* Sync status indicator */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            disabled={isSyncing || !isOnline}
            onClick={forceSync}
          >
            {isOnline ? (
              isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )
            ) : (
              <CloudOff className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-xs hidden sm:inline ml-1">
              {isOnline ? 
                (isSyncing ? 'Syncing...' : `Last: ${formatSyncTime()}`) : 
                'Offline'
              }
            </span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
