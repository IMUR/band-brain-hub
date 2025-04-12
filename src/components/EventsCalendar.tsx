
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, X, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'gig' | 'rehearsal' | 'other';
}

const EventsCalendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Live at The Garage',
      date: '2025-04-18',
      location: 'The Garage, 123 Music St',
      type: 'gig'
    },
    {
      id: '2',
      title: 'Rehearsal for new songs',
      date: '2025-04-15',
      location: 'Studio B',
      type: 'rehearsal'
    }
  ]);
  
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: '',
    location: '',
    type: 'gig'
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title and date",
        variant: "destructive"
      });
      return;
    }
    
    const event = {
      ...newEvent,
      id: Date.now().toString()
    };
    
    setEvents([...events, event]);
    setNewEvent({
      title: '',
      date: '',
      location: '',
      type: 'gig'
    });
    
    setDialogOpen(false);
    
    toast({
      title: "Event added",
      description: `${event.title} has been added to your calendar`,
    });
  };
  
  const removeEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Event removed",
      description: "The event has been removed from your calendar",
    });
  };
  
  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'gig':
        return 'bg-band-purple';
      case 'rehearsal':
        return 'bg-band-blue';
      default:
        return 'bg-band-yellow';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-band-purple" />
          Upcoming Events
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <input
                  className="band-input"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  className="band-input"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  className="band-input"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Event location"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <select
                  className="band-input"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                >
                  <option value="gig">Gig</option>
                  <option value="rehearsal">Rehearsal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <Button onClick={addEvent} className="w-full mt-4">
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No upcoming events. Add your first event!
          </div>
        ) : (
          <div className="space-y-3">
            {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => (
              <div key={event.id} className="flex items-start justify-between rounded-md p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`${getEventTypeColor(event.type)} h-12 w-1 rounded-full flex-shrink-0 mt-1`}></div>
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={() => removeEvent(event.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsCalendar;
