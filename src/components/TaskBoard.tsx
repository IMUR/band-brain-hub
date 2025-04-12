
import React, { useState } from 'react';
import { CheckSquare, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  dueDate?: string;
}

const TaskBoard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Book studio time for next week',
      assignee: 'Mike',
      completed: false,
      dueDate: '2025-04-17'
    },
    {
      id: '2',
      title: 'Design new merch for summer tour',
      assignee: 'Sarah',
      completed: true
    }
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  
  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignee: newTaskAssignee,
      completed: false,
      dueDate: newTaskDue || undefined
    };
    
    setTasks([...tasks, task]);
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskDue('');
    
    toast({
      title: "Task added",
      description: `"${task.title}" has been added to your tasks`,
    });
  };
  
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task removed",
      description: "The task has been removed from your board",
    });
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
              <Button onClick={addTask} className="col-span-1">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.length === 0 ? (
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
                        onClick={() => toggleComplete(task.id)}
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
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full"
                      onClick={() => removeTask(task.id)}
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
                            onClick={() => toggleComplete(task.id)}
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
                          onClick={() => removeTask(task.id)}
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
      </CardContent>
    </Card>
  );
};

export default TaskBoard;
