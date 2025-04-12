
import React from 'react';
import Header from '@/components/Header';
import EventsCalendar from '@/components/EventsCalendar';
import TaskBoard from '@/components/TaskBoard';
import NotesBoard from '@/components/NotesBoard';
import BudgetTracker from '@/components/BudgetTracker';
import SetListManager from '@/components/SetListManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  
  const renderContent = () => {
    if (isMobile && !activeSection) {
      // Mobile dashboard view (no section selected)
      return (
        <div className="px-4 py-6 space-y-6">
          <section 
            className="band-card group cursor-pointer transition-all"
            onClick={() => setActiveSection('events')}
          >
            <h2 className="text-lg font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-band-purple mr-2"></div>
              Upcoming Events
            </h2>
            <p className="text-sm text-muted-foreground mt-1">View and manage your gigs and rehearsals</p>
          </section>
          
          <section 
            className="band-card group cursor-pointer transition-all"
            onClick={() => setActiveSection('tasks')}
          >
            <h2 className="text-lg font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-band-green mr-2"></div>
              Tasks
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Track band responsibilities and to-dos</p>
          </section>
          
          <section 
            className="band-card group cursor-pointer transition-all"
            onClick={() => setActiveSection('notes')}
          >
            <h2 className="text-lg font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-band-yellow mr-2"></div>
              Notes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Lyrics, ideas and band discussions</p>
          </section>
          
          <section 
            className="band-card group cursor-pointer transition-all"
            onClick={() => setActiveSection('budget')}
          >
            <h2 className="text-lg font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-band-blue mr-2"></div>
              Budget
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Track income and expenses</p>
          </section>
          
          <section 
            className="band-card group cursor-pointer transition-all"
            onClick={() => setActiveSection('setlist')}
          >
            <h2 className="text-lg font-medium flex items-center">
              <div className="h-3 w-3 rounded-full bg-band-deep-purple mr-2"></div>
              Set Lists
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Create and organize your performance setlists</p>
          </section>
        </div>
      );
    }
    
    // Mobile with section selected or desktop view
    const isFullWidth = isMobile || ['setlist'].includes(activeSection || '');
    
    return (
      <div className="container py-6 flex-1">
        {isMobile && activeSection && (
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => setActiveSection(null)}
            >
              <X className="h-4 w-4 mr-1" /> Back
            </Button>
            <h2 className="text-lg font-semibold">
              {activeSection === 'events' && 'Upcoming Events'}
              {activeSection === 'tasks' && 'Tasks'}
              {activeSection === 'notes' && 'Notes'}
              {activeSection === 'budget' && 'Budget'}
              {activeSection === 'setlist' && 'Set Lists'}
            </h2>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(!isMobile || activeSection === 'events') && <EventsCalendar />}
          {(!isMobile || activeSection === 'tasks') && <TaskBoard />}
          {(!isMobile || activeSection === 'notes') && <NotesBoard />}
          {(!isMobile || activeSection === 'budget') && <BudgetTracker />}
          {(!isMobile || activeSection === 'setlist') && (
            <div className={isFullWidth ? "md:col-span-2" : ""}>
              <SetListManager />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header bandName="Band" />
      
      {renderContent()}
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>Band Brain Hub • Your band's command center • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
