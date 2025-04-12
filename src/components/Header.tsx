
import React from 'react';
import { Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = ({ bandName }: { bandName: string }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center">
        <Music className="h-5 w-5 mr-2 text-band-purple animate-pulse-light" />
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
          {bandName} <span className="text-band-purple">Brain</span>Hub
        </h1>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Header;
