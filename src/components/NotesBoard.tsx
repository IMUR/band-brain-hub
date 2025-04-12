import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Edit, Save, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useBand } from '@/contexts/BandContext';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/lib/services/NoteService';
import { format } from 'date-fns';

const NotesBoard = () => {
  const { toast } = useToast();
  const { currentBand } = useBand();
  const { user } = useAuth();
  
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  const {
    data: notes,
    loading,
    error,
    add: addNote,
    update: updateNote,
    remove: removeNote
  } = useSupabaseQuery<Note>({
    table: 'notes',
    bandId: currentBand?.id,
    orderBy: { column: 'created_at', ascending: false }
  });
  
  const handleAddNote = async () => {
    if (!currentBand || !user) {
      toast({
        title: "Error",
        description: "You need to select a band first",
        variant: "destructive"
      });
      return;
    }
    
    if (!newNoteTitle.trim()) {
      toast({
        title: "Note title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addNote({
        band_id: currentBand.id,
        title: newNoteTitle,
        content: newNoteContent,
        category: null,
        created_by: user.id
      });
      
      setNewNoteTitle('');
      setNewNoteContent('');
      
      toast({
        title: "Note added",
        description: `"${newNoteTitle}" has been added to your notes`,
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Failed to add note",
        description: "There was an error adding your note. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEdit = (note: Note) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };
  
  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: "Note title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updateNote(id, {
        title: editTitle,
        content: editContent
      });
      
      setEditingNote(null);
      
      toast({
        title: "Note updated",
        description: `"${editTitle}" has been updated`,
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Failed to update note",
        description: "There was an error updating your note. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (id: string, title: string) => {
    try {
      await removeNote(id);
      
      toast({
        title: "Note deleted",
        description: `"${title}" has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Failed to delete note",
        description: "There was an error deleting your note. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <StickyNote className="h-5 w-5 mr-2 text-band-yellow" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!currentBand ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Select a band to manage notes</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Input
                placeholder="Note title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="band-input"
              />
              <Textarea
                placeholder="Note content..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="band-input min-h-[80px]"
              />
              <Button onClick={handleAddNote} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading notes...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <p>Error loading notes</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Reload
                  </Button>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No notes yet. Add your first note above!
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 rounded-md bg-secondary/30 hover:bg-secondary/40 transition-colors">
                    {editingNote === note.id ? (
                      <>
                        <div className="space-y-2 mb-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="band-input"
                          />
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="band-input min-h-[100px]"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingNote(null)}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSaveEdit(note.id)}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">{note.title}</h3>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDelete(note.id, note.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground mb-2">
                          {formatDate(note.created_at)}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesBoard;
