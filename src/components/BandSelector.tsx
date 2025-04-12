import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Music } from 'lucide-react';
import { useBand } from '@/contexts/BandContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const BandSelector = () => {
  const { bands, currentBand, setCurrentBand, createBand } = useBand();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBandName, setNewBandName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSelectBand = (bandId: string) => {
    const selected = bands.find(band => band.id === bandId);
    if (selected) {
      setCurrentBand(selected);
    }
  };
  
  const handleCreateBand = async () => {
    if (!newBandName.trim()) {
      toast({
        variant: "destructive",
        title: "Band name required",
        description: "Please enter a name for your band"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      await createBand(newBandName);
      setNewBandName('');
      setIsDialogOpen(false);
      toast({
        title: "Band created",
        description: `"${newBandName}" has been created successfully`
      });
    } catch (error) {
      console.error('Error creating band:', error);
      toast({
        variant: "destructive",
        title: "Failed to create band",
        description: "There was an error creating your band. Please try again."
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 min-w-[180px]">
        <Select
          value={currentBand?.id || ''}
          onValueChange={handleSelectBand}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a band" />
          </SelectTrigger>
          <SelectContent>
            {bands.length === 0 ? (
              <div className="text-center py-2 text-muted-foreground">
                <p>No bands yet</p>
                <p className="text-xs">Create your first band</p>
              </div>
            ) : (
              bands.map(band => (
                <SelectItem key={band.id} value={band.id}>
                  <div className="flex items-center">
                    <Music className="mr-2 h-4 w-4 text-muted-foreground" />
                    {band.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new band</DialogTitle>
            <DialogDescription>
              Add a new band to organize your music projects
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bandName">Band Name</Label>
            <Input
              id="bandName"
              value={newBandName}
              onChange={e => setNewBandName(e.target.value)}
              placeholder="Enter band name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateBand}
              disabled={isCreating || !newBandName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Band'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BandSelector; 