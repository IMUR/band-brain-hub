
import React from 'react';
import { Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ bandName }: { bandName: string }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      <div className="flex items-center">
        <Music className="h-6 w-6 mr-2 text-band-purple animate-pulse-light" />
        <h1 className="text-xl font-bold">{bandName} <span className="text-band-purple">Brain</span>Hub</h1>
      </div>
      <Button variant="ghost" size="icon">
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Header;
