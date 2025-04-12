import React, { useState } from 'react';
import { CheckSquare, Plus, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useBand } from '@/contexts/BandContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/lib/services/TaskService';
import { format } from 'date-fns';

const TaskBoard = () => {
  const { toast } = useToast();
  const { currentBand } = useBand();
  const { user } = useAuth();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  
  const {
    data: tasks,
    loading,
    error,
    add: addTask,
    update: updateTask,
    remove: removeTask
  } = useSupabaseQuery<Task>({
    table: 'tasks',
    bandId: currentBand?.id,
    orderBy: { column: 'created_at', ascending: false }
  });
  
  const handleAddTask = async () => {
    if (!currentBand || !user) {
      toast({
        title: "Error",
        description: "You need to select a band first",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTaskTitle.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addTask({
        band_id: currentBand.id,
        title: newTaskTitle,
        assignee: newTaskAssignee || 'Unassigned',
        completed: false,
        dueDate: newTaskDue || null,
        created_by: user.id
      });
      
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setNewTaskDue('');
      
      toast({
        title: "Task added",
        description: `"${newTaskTitle}" has been added to your tasks`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Failed to add task",
        description: "There was an error adding your task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateTask(id, { completed: !completed });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Failed to update task",
        description: "There was an error updating your task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveTask = async (id: string) => {
    try {
      await removeTask(id);
      toast({
        title: "Task removed",
        description: "The task has been removed from your board",
      });
    } catch (error) {
      console.error('Error removing task:', error);
      toast({
        title: "Failed to remove task",
        description: "There was an error removing your task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="band-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <CheckSquare className="h-5 w-5 mr-2 text-band-green" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!currentBand ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Select a band to manage tasks</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="band-input col-span-5"
                />
                <input
                  type="text"
                  placeholder="Assignee"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="band-input col-span-3"
                />
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="band-input col-span-3"
                />
                <Button onClick={handleAddTask} className="col-span-1">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading tasks...
                </div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <p>Error loading tasks</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Reload
                  </Button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No tasks yet. Add your first task above!
                </div>
              ) : (
                <>
                  {/* Incomplete tasks */}
                  {tasks.filter(task => !task.completed).map(task => (
                    <div key={task.id} className="flex items-start justify-between rounded-md p-3 bg-secondary/30 hover:bg-secondary/40 transition-colors">
                      <div className="flex items-start space-x-3">
                        <Button
                          variant="outline" 
                          size="icon" 
                          className="h-5 w-5 rounded-md mt-1 border-band-green"
                          onClick={() => handleToggleComplete(task.id, task.completed)}
                        >
                          <span className="sr-only">Complete task</span>
                        </Button>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                            {task.assignee && (
                              <span className="bg-band-green/20 px-1.5 py-0.5 rounded text-band-green">{task.assignee}</span>
                            )}
                            {task.dueDate && (
                              <span>{formatDate(task.dueDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleRemoveTask(task.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Completed tasks */}
                  {tasks.filter(task => task.completed).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed Tasks</h3>
                      {tasks.filter(task => task.completed).map(task => (
                        <div key={task.id} className="flex items-start justify-between rounded-md p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-start space-x-3">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-5 w-5 rounded-md mt-1 bg-band-green border-band-green"
                              onClick={() => handleToggleComplete(task.id, task.completed)}
                            >
                              <CheckSquare className="h-3 w-3 text-background" />
                              <span className="sr-only">Undo complete task</span>
                            </Button>
                            <div>
                              <h3 className="font-medium line-through opacity-70">{task.title}</h3>
                              {task.assignee && (
                                <span className="text-xs text-muted-foreground">{task.assignee}</span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full"
                            onClick={() => handleRemoveTask(task.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskBoard;
