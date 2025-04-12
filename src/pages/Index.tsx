import React from 'react';
import Header from '@/components/Header';
import TaskBoard from '@/components/TaskBoard';
import EventsCalendar from '@/components/EventsCalendar';
import NotesBoard from '@/components/NotesBoard';
import BudgetTracker from '@/components/BudgetTracker';
import SetListManager from '@/components/SetListManager';
import { useAuth } from '@/contexts/AuthContext';
import { useBand } from '@/contexts/BandContext';

const Index = () => {
  const { user } = useAuth();
  const { currentBand } = useBand();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskBoard />
          <EventsCalendar />
          <BudgetTracker />
          <div className="lg:col-span-2">
            <SetListManager />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <NotesBoard />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>Band Brain Hub - Your band's digital headquarters</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
