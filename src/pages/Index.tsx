
import React from 'react';
import Header from '@/components/Header';
import EventsCalendar from '@/components/EventsCalendar';
import TaskBoard from '@/components/TaskBoard';
import NotesBoard from '@/components/NotesBoard';
import BudgetTracker from '@/components/BudgetTracker';
import SetListManager from '@/components/SetListManager';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header bandName="Band" />
      
      <div className="container py-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventsCalendar />
          <TaskBoard />
          <NotesBoard />
          <BudgetTracker />
          <div className="md:col-span-2">
            <SetListManager />
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>Band Brain Hub • Your band's command center • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
