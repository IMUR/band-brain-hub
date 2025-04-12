
import React, { useState } from 'react';
import { Book, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

const NotesBoard = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'New song lyrics idea',
      content: "Verse 1:\nWalking through the city streets at night\nLights are blinding but I feel alright\n\nChorus:\nThis is where we belong\nThis is our midnight song",
      createdAt: '2025-04-08T15:32:00',
      author: 'Jake'
    },
    {
      id: '2',
      title: 'For our next music video',
      content: "Let's film in the abandoned factory we saw last week. I think the aesthetic would be perfect for the new single.",
      createdAt: '2025-04-10T09:15:00',
      author: 'Lisa'
    }
  ]);
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    author: ''
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  const addNote = () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Missing information",
        description: "Please add a title and content",
        variant: "destructive"
      });
      return;
    }
    
    const note = {
      ...newNote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotes([...notes, note]);
    setNewNote({
      title: '',
      content: '',
      author: ''
    });
    
    setDialogOpen(false);
    
    toast({
      title: "Note added",
      description: "Your note has been added to the board",
    });
  };
  
  const removeNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    if (viewNote?.id === id) {
      setViewNote(null);
      setViewOpen(false);
    }
    
    toast({
      title: "Note removed",
      description: "The note has been removed from your board",
    });
  };
  
  const openViewNote = (note: Note) => {
    setViewNote(note);
    setViewOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <Book className="h-5 w-5 mr-2 text-band-yellow" />
          Notes
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="h-4 w-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  className="band-input"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Note title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  className="band-input min-h-[120px]"
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Write your note here..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <input
                  className="band-input"
                  value={newNote.author}
                  onChange={(e) => setNewNote({...newNote, author: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              
              <Button onClick={addNote} className="w-full mt-4">
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{viewNote?.title}</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                <span>{viewNote?.author}</span>
                <span>{viewNote && formatDate(viewNote.createdAt)}</span>
              </div>
              <div className="whitespace-pre-wrap bg-secondary/30 p-4 rounded-md">
                {viewNote?.content}
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => viewNote && removeNote(viewNote.id)}
                >
                  <X className="h-4 w-4 mr-1" /> Delete Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notes yet. Create your first note!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(note => (
              <div 
                key={note.id} 
                className="cursor-pointer rounded-md p-3 bg-secondary/30 hover:bg-secondary/50 transition-all h-[120px] flex flex-col border border-transparent hover:border-band-yellow/30"
                onClick={() => openViewNote(note)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">{note.title}</h3>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                  <span>{note.author}</span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-sm mt-2 overflow-hidden line-clamp-3 flex-grow">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesBoard;
