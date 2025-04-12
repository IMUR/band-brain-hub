
import React from 'react';
import { Music, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const Header = ({ bandName }: { bandName: string }) => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center">
        <Music className="h-5 w-5 mr-2 text-band-purple animate-pulse-light" />
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
          {bandName} <span className="text-band-purple">Brain</span>Hub
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        {user && (
          <div className="mr-2 text-sm text-muted-foreground">
            {user.email?.split('@')[0]}
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
