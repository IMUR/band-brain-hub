
import React, { useState } from 'react';
import { Music2, Plus, X, GripVertical, Edit, Check, ListMusic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Song {
  id: string;
  title: string;
  duration: string; // in format "MM:SS"
  key?: string;
  notes?: string;
}

interface SetList {
  id: string;
  name: string;
  songs: Song[];
}

const SetListManager = () => {
  const { toast } = useToast();
  
  // Demo data
  const [setLists, setSetLists] = useState<SetList[]>([
    {
      id: '1',
      name: 'Downtown Bar Gig',
      songs: [
        { id: '1-1', title: 'Midnight Highway', duration: '04:32', key: 'G' },
        { id: '1-2', title: 'Lost in the City', duration: '03:48', key: 'Am' },
        { id: '1-3', title: 'Echoes of Yesterday', duration: '05:15', key: 'C' }
      ]
    }
  ]);
  
  const [newSetList, setNewSetList] = useState({
    name: ''
  });
  
  const [newSong, setNewSong] = useState<Omit<Song, 'id'>>({
    title: '',
    duration: '',
    key: '',
    notes: ''
  });
  
  const [currentSetListId, setCurrentSetListId] = useState<string | null>('1');
  const [createSetListOpen, setCreateSetListOpen] = useState(false);
  const [addSongOpen, setAddSongOpen] = useState(false);
  
  // Add a new setlist
  const createSetList = () => {
    if (!newSetList.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your set list",
        variant: "destructive"
      });
      return;
    }
    
    const setList = {
      id: Date.now().toString(),
      name: newSetList.name,
      songs: []
    };
    
    setSetLists([...setLists, setList]);
    setNewSetList({ name: '' });
    setCreateSetListOpen(false);
    setCurrentSetListId(setList.id);
    
    toast({
      title: "Set list created",
      description: `"${setList.name}" has been created`,
    });
  };
  
  // Add a song to the current setlist
  const addSong = () => {
    if (!currentSetListId || !newSong.title || !newSong.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title and duration",
        variant: "destructive"
      });
      return;
    }
    
    const song = {
      ...newSong,
      id: `${currentSetListId}-${Date.now()}`
    };
    
    setSetLists(setLists.map(list => 
      list.id === currentSetListId
        ? { ...list, songs: [...list.songs, song] }
        : list
    ));
    
    setNewSong({
      title: '',
      duration: '',
      key: '',
      notes: ''
    });
    
    setAddSongOpen(false);
    
    toast({
      title: "Song added",
      description: `"${song.title}" has been added to the set list`,
    });
  };
  
  // Remove a song from a setlist
  const removeSong = (setListId: string, songId: string) => {
    setSetLists(setLists.map(list => 
      list.id === setListId
        ? { ...list, songs: list.songs.filter(song => song.id !== songId) }
        : list
    ));
    
    toast({
      title: "Song removed",
      description: "The song has been removed from the set list",
    });
  };
  
  // Remove an entire setlist
  const removeSetList = (id: string) => {
    setSetLists(setLists.filter(list => list.id !== id));
    
    if (currentSetListId === id) {
      setCurrentSetListId(setLists.length > 1 ? setLists[0].id : null);
    }
    
    toast({
      title: "Set list removed",
      description: "The set list has been removed",
    });
  };
  
  // Move a song up or down in the setlist
  const moveSong = (setListId: string, songIndex: number, direction: 'up' | 'down') => {
    const setList = setLists.find(list => list.id === setListId);
    if (!setList) return;
    
    const newSongs = [...setList.songs];
    
    if (direction === 'up' && songIndex > 0) {
      // Swap with previous song
      [newSongs[songIndex], newSongs[songIndex - 1]] = [newSongs[songIndex - 1], newSongs[songIndex]];
    } else if (direction === 'down' && songIndex < newSongs.length - 1) {
      // Swap with next song
      [newSongs[songIndex], newSongs[songIndex + 1]] = [newSongs[songIndex + 1], newSongs[songIndex]];
    }
    
    setSetLists(setLists.map(list => 
      list.id === setListId
        ? { ...list, songs: newSongs }
        : list
    ));
  };
  
  // Calculate total setlist duration
  const calculateSetListDuration = (songs: Song[]) => {
    let totalSeconds = songs.reduce((total, song) => {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return total + minutes * 60 + seconds;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };
  
  // Get the current setlist
  const currentSetList = setLists.find(list => list.id === currentSetListId) || null;

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <ListMusic className="h-5 w-5 mr-2 text-band-purple" />
          Set Lists
        </CardTitle>
        
        <div className="flex space-x-2">
          <Dialog open={addSongOpen} onOpenChange={setAddSongOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="h-8 gap-1"
                disabled={!currentSetListId}
              >
                <Plus className="h-4 w-4" /> Add Song
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Song</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Song Title</label>
                  <input
                    className="band-input"
                    value={newSong.title}
                    onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                    placeholder="Song title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (MM:SS)</label>
                  <input
                    className="band-input"
                    value={newSong.duration}
                    onChange={(e) => setNewSong({...newSong, duration: e.target.value})}
                    placeholder="03:45"
                    pattern="[0-9]{2}:[0-9]{2}"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key (optional)</label>
                  <input
                    className="band-input"
                    value={newSong.key}
                    onChange={(e) => setNewSong({...newSong, key: e.target.value})}
                    placeholder="E.g. C, Am, F#"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea
                    className="band-input min-h-[80px]"
                    value={newSong.notes}
                    onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
                    placeholder="Any notes about the song..."
                  />
                </div>
                
                <Button onClick={addSong} className="w-full mt-4">
                  Add to Set List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createSetListOpen} onOpenChange={setCreateSetListOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1" variant="outline">
                <Plus className="h-4 w-4" /> New Set List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Set List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Set List Name</label>
                  <input
                    className="band-input"
                    value={newSetList.name}
                    onChange={(e) => setNewSetList({name: e.target.value})}
                    placeholder="E.g. Friday Night Gig"
                  />
                </div>
                
                <Button onClick={createSetList} className="w-full mt-4">
                  Create Set List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {setLists.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No set lists yet. Create your first set list!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Set list tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {setLists.map(setList => (
                <button
                  key={setList.id}
                  onClick={() => setCurrentSetListId(setList.id)}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center whitespace-nowrap ${
                    currentSetListId === setList.id 
                      ? 'bg-band-purple text-white' 
                      : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  <Music2 className="h-3.5 w-3.5 mr-1.5" />
                  {setList.name}
                  {currentSetListId === setList.id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1.5 rounded-full hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSetList(setList.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </button>
              ))}
            </div>
            
            {/* Current set list */}
            {currentSetList && (
              <>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="text-muted-foreground">
                    {currentSetList.songs.length} song{currentSetList.songs.length !== 1 ? 's' : ''}
                  </div>
                  {currentSetList.songs.length > 0 && (
                    <div className="text-muted-foreground">
                      Total: {calculateSetListDuration(currentSetList.songs)}
                    </div>
                  )}
                </div>
                
                {currentSetList.songs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-md">
                    No songs added to this set list yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {currentSetList.songs.map((song, index) => (
                      <div 
                        key={song.id} 
                        className="flex items-center p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 cursor-grab opacity-70 hover:opacity-100"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <h3 className="font-medium">{song.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-band-purple/20 text-band-purple px-1.5 py-0.5 rounded">{song.duration}</span>
                                {song.key && (
                                  <span className="text-xs bg-secondary/70 px-1.5 py-0.5 rounded">{song.key}</span>
                                )}
                              </div>
                            </div>
                            {song.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{song.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full"
                            onClick={() => moveSong(currentSetList.id, index, 'up')}
                            disabled={index === 0}
                          >
                            <span className="sr-only">Move up</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m18 15-6-6-6 6"/>
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full"
                            onClick={() => moveSong(currentSetList.id, index, 'down')}
                            disabled={index === currentSetList.songs.length - 1}
                          >
                            <span className="sr-only">Move down</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full"
                            onClick={() => removeSong(currentSetList.id, song.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SetListManager;
