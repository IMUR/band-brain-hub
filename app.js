// Type definitions (used for documentation, not enforced at runtime)
/* 
Types:
- User { id: string, name: string, avatar?: string, role?: string }
- Event { id: string, title: string, date: string, time: string, location: string, type: 'gig' | 'rehearsal' | 'other', description?: string }
- Task { id: string, title: string, completed: boolean, assignee?: string }
- Note { id: string, title: string, content: string, author: string, createdAt: string }
- Transaction { id: string, description: string, amount: number, type: 'income' | 'expense', category?: string, date: string }
- Song { id: string, title: string, duration: string, key?: string, tempo?: number, notes?: string }
- Setlist { id: string, name: string, songs: Song[] }
*/

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">BandBrain</h1>
          <p className="text-gray-600 mb-6">Your band's digital hub</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>For demo purposes, enter any username and password.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Events Tab Component
const EventsTab = ({ events, addEvent, updateEvent, deleteEvent, darkMode }) => {
  const [showNewEventForm, setShowNewEventForm] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    type: 'rehearsal',
    description: ''
  });
  const [editingEventId, setEditingEventId] = React.useState(null);

  const handleAddEvent = (e) => {
    e.preventDefault();
    addEvent(newEvent);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      type: 'rehearsal',
      description: ''
    });
    setShowNewEventForm(false);
  };

  const handleUpdateEvent = (e, eventId) => {
    e.preventDefault();
    const eventToUpdate = events.find(event => event.id === eventId);
    updateEvent(eventToUpdate);
    setEditingEventId(null);
  };

  const handleInputChange = (e, eventId = null) => {
    const { name, value } = e.target;
    
    if (eventId) {
      // Updating existing event
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return { ...event, [name]: value };
        }
        return event;
      });
      events = updatedEvents;
      updateEvent(events.find(event => event.id === eventId));
    } else {
      // Updating new event form
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'gig': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'rehearsal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Separate upcoming and past events
  const upcomingEvents = sortedEvents.filter(event => event.date >= todayStr);
  const pastEvents = sortedEvents.filter(event => event.date < todayStr);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Events</h2>
        <button
          onClick={() => setShowNewEventForm(!showNewEventForm)}
          className={`px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >
          {showNewEventForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {/* New event form */}
      {showNewEventForm && (
        <form 
          onSubmit={handleAddEvent}
          className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={newEvent.type}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="gig">Gig</option>
                <option value="rehearsal">Rehearsal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={newEvent.time}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={(e) => handleInputChange(e)}
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Event
            </button>
          </div>
        </form>
      )}

      {/* Upcoming events */}
      <h3 className="text-xl font-semibold mt-8 mb-4">Upcoming Events</h3>
      {upcomingEvents.length === 0 ? (
        <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No upcoming events. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map(event => (
            <div 
              key={event.id} 
              className={`card rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {editingEventId === event.id ? (
                // Edit form
                <form onSubmit={(e) => handleUpdateEvent(e, event.id)}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={event.title}
                        onChange={(e) => handleInputChange(e, event.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        name="type"
                        value={event.type}
                        onChange={(e) => handleInputChange(e, event.id)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="gig">Gig</option>
                        <option value="rehearsal">Rehearsal</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={event.date}
                        onChange={(e) => handleInputChange(e, event.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={event.time}
                        onChange={(e) => handleInputChange(e, event.id)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={event.location}
                        onChange={(e) => handleInputChange(e, event.id)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        name="description"
                        value={event.description}
                        onChange={(e) => handleInputChange(e, event.id)}
                        rows="3"
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => setEditingEventId(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                // Display event
                <>
                  <div className="flex justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <div className="space-x-1">
                      <button 
                        onClick={() => setEditingEventId(event.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                  
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="flex items-center">
                      <i className="fas fa-calendar-day mr-2"></i>
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {event.time && ` @ ${event.time}`}
                    </p>
                    {event.location && (
                      <p className="flex items-center">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {event.location}
                      </p>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {event.description}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past events */}
      {pastEvents.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4">Past Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map(event => (
              <div 
                key={event.id} 
                className={`card rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800 opacity-75' : 'bg-white opacity-75'}`}
              >
                <div className="flex justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                
                <div className="mt-2 space-y-1 text-sm">
                  <p className="flex items-center">
                    <i className="fas fa-calendar-day mr-2"></i>
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {event.time && ` @ ${event.time}`}
                  </p>
                  {event.location && (
                    <p className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Tasks Tab Component
const TasksTab = ({ tasks, users, addTask, updateTask, deleteTask, darkMode }) => {
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [editingTaskId, setEditingTaskId] = React.useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = React.useState('');
  const [editingTaskAssignee, setEditingTaskAssignee] = React.useState('');
  
  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim() });
      setNewTaskTitle('');
    }
  };
  
  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    updateTask({ ...task, completed: !task.completed });
  };
  
  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskAssignee(task.assignee || '');
  };
  
  const handleUpdateTask = (e) => {
    e.preventDefault();
    const task = tasks.find(t => t.id === editingTaskId);
    updateTask({ 
      ...task, 
      title: editingTaskTitle.trim(),
      assignee: editingTaskAssignee || null
    });
    setEditingTaskId(null);
  };
  
  const cancelEditingTask = () => {
    setEditingTaskId(null);
  };
  
  // Separate tasks into completed and not completed
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
      </div>
      
      {/* Add task form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className={`flex-grow px-4 py-2 border rounded-l-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600"
          >
            Add
          </button>
        </div>
      </form>
      
      {/* Incomplete tasks */}
      <h3 className="text-xl font-semibold mt-8 mb-4">To Do</h3>
      {incompleteTasks.length === 0 ? (
        <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No tasks to do. Add one to get started!</p>
      ) : (
        <div className={`rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          {incompleteTasks.map(task => (
            <div 
              key={task.id} 
              className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}
            >
              {editingTaskId === task.id ? (
                <form onSubmit={handleUpdateTask}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="h-5 w-5 text-indigo-600"
                    />
                    <div className="ml-4 flex-grow">
                      <input
                        type="text"
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <select
                        value={editingTaskAssignee || ''}
                        onChange={(e) => setEditingTaskAssignee(e.target.value)}
                        className={`mt-2 w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user.id} value={user.name}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-2 flex">
                      <button
                        type="button"
                        onClick={cancelEditingTask}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <button
                        type="submit"
                        className="p-2 text-green-500 hover:text-green-600"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    className="h-5 w-5 text-indigo-600"
                  />
                  <div className="ml-4 flex-grow">
                    <div 
                      onClick={() => startEditingTask(task)}
                      className="text-md cursor-pointer hover:text-indigo-500"
                    >
                      {task.title}
                    </div>
                    {task.assignee && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Assigned to: {task.assignee}
                      </div>
                    )}
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => startEditingTask(task)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4">Completed</h3>
          <div className={`rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            {completedTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0 opacity-75`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    className="h-5 w-5 text-gray-400"
                  />
                  <div className="ml-4 flex-grow">
                    <div className="text-md line-through text-gray-500 dark:text-gray-400">
                      {task.title}
                    </div>
                    {task.assignee && (
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Completed by: {task.assignee}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Notes Tab Component
const NotesTab = ({ notes, addNote, updateNote, deleteNote, darkMode }) => {
  const [showNewNoteForm, setShowNewNoteForm] = React.useState(false);
  const [newNote, setNewNote] = React.useState({
    title: '',
    content: ''
  });
  const [editingNoteId, setEditingNoteId] = React.useState(null);
  const [expandedNotes, setExpandedNotes] = React.useState({});
  
  const handleAddNote = (e) => {
    e.preventDefault();
    if (newNote.title.trim() && newNote.content.trim()) {
      addNote(newNote);
      setNewNote({
        title: '',
        content: ''
      });
      setShowNewNoteForm(false);
    }
  };
  
  const handleUpdateNote = (e) => {
    e.preventDefault();
    const noteToUpdate = notes.find(note => note.id === editingNoteId);
    updateNote(noteToUpdate);
    setEditingNoteId(null);
  };
  
  const handleInputChange = (e, noteId = null) => {
    const { name, value } = e.target;
    
    if (noteId) {
      // Updating existing note
      const updatedNotes = notes.map(note => {
        if (note.id === noteId) {
          return { ...note, [name]: value };
        }
        return note;
      });
      notes = updatedNotes;
      updateNote(notes.find(note => note.id === noteId));
    } else {
      // Updating new note form
      setNewNote({ ...newNote, [name]: value });
    }
  };
  
  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };
  
  // Sort notes by creation date, newest first
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notes</h2>
        <button
          onClick={() => setShowNewNoteForm(!showNewNoteForm)}
          className={`px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >
          {showNewNoteForm ? 'Cancel' : 'Add Note'}
        </button>
      </div>
      
      {/* New note form */}
      {showNewNoteForm && (
        <form 
          onSubmit={handleAddNote}
          className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={newNote.title}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                name="content"
                value={newNote.content}
                onChange={(e) => handleInputChange(e)}
                required
                rows="6"
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Note
            </button>
          </div>
        </form>
      )}
      
      {/* Notes grid */}
      {sortedNotes.length === 0 ? (
        <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No notes yet. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map(note => (
            <div 
              key={note.id} 
              className={`card rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              {editingNoteId === note.id ? (
                // Edit form
                <form onSubmit={(e) => handleUpdateNote(e)}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={note.title}
                        onChange={(e) => handleInputChange(e, note.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea
                        name="content"
                        value={note.content}
                        onChange={(e) => handleInputChange(e, note.id)}
                        required
                        rows="6"
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                // Display note
                <>
                  <div className="flex justify-between">
                    <h3 
                      className="text-lg font-semibold cursor-pointer hover:text-indigo-500"
                      onClick={() => toggleNoteExpansion(note.id)}
                    >
                      {note.title}
                      <i className={`fas fa-chevron-${expandedNotes[note.id] ? 'up' : 'down'} ml-2 text-sm`}></i>
                    </h3>
                    <div className="space-x-1">
                      <button 
                        onClick={() => setEditingNoteId(note.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className={`mt-2 overflow-hidden transition-all duration-300 ${expandedNotes[note.id] ? 'max-h-96' : 'max-h-20'}`}>
                    <p className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <p>{note.author}</p>
                    <p>{new Date(note.createdAt).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Budget Tab Component
const BudgetTab = ({ transactions, addTransaction, updateTransaction, deleteTransaction, darkMode }) => {
  const [showNewTransactionForm, setShowNewTransactionForm] = React.useState(false);
  const [newTransaction, setNewTransaction] = React.useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingTransactionId, setEditingTransactionId] = React.useState(null);
  const [filterPeriod, setFilterPeriod] = React.useState('all');
  
  const categories = {
    income: ['Gig', 'Merch', 'Streaming', 'Other'],
    expense: ['Equipment', 'Studio', 'Travel', 'Promotion', 'Other']
  };
  
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.description.trim() && !isNaN(parseFloat(newTransaction.amount))) {
      addTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowNewTransactionForm(false);
    }
  };
  
  const handleUpdateTransaction = (e) => {
    e.preventDefault();
    const transactionToUpdate = transactions.find(t => t.id === editingTransactionId);
    updateTransaction(transactionToUpdate);
    setEditingTransactionId(null);
  };
  
  const handleInputChange = (e, transactionId = null) => {
    const { name, value } = e.target;
    
    if (transactionId) {
      // Updating existing transaction
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.id === transactionId) {
          return { 
            ...transaction, 
            [name]: name === 'amount' ? parseFloat(value) : value 
          };
        }
        return transaction;
      });
      transactions = updatedTransactions;
      updateTransaction(transactions.find(t => t.id === transactionId));
    } else {
      // Updating new transaction form
      setNewTransaction({ ...newTransaction, [name]: value });
    }
  };
  
  // Filter transactions by period
  const getFilteredTransactions = () => {
    if (filterPeriod === 'all') return transactions;
    
    const now = new Date();
    let startDate;
    
    switch (filterPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(transaction => new Date(transaction.date) >= startDate);
  };
  
  // Calculate totals
  const filteredTransactions = getFilteredTransactions();
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Sort transactions by date, newest first
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Budget</h2>
        <button
          onClick={() => setShowNewTransactionForm(!showNewTransactionForm)}
          className={`px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >
          {showNewTransactionForm ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-2">Income</h3>
          <p className="text-2xl text-green-500">{formatCurrency(totalIncome)}</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-2">Expenses</h3>
          <p className="text-2xl text-red-500">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-2">Balance</h3>
          <p className={`text-2xl ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
      
      {/* New transaction form */}
      {showNewTransactionForm && (
        <form 
          onSubmit={handleAddTransaction}
          className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={newTransaction.amount}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={newTransaction.type}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={newTransaction.category}
                onChange={(e) => handleInputChange(e)}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">Select a category</option>
                {categories[newTransaction.type].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={(e) => handleInputChange(e)}
                required
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}
      
      {/* Transactions list */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Transactions</h3>
        <div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className={`px-3 py-1 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No transactions yet. Add one to get started!</p>
      ) : (
        <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
              {sortedTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.category || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                    <button 
                      onClick={() => setEditingTransactionId(transaction.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Edit transaction modal */}
      {editingTransactionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-semibold mb-4">Edit Transaction</h3>
            <form onSubmit={handleUpdateTransaction}>
              {(() => {
                const transaction = transactions.find(t => t.id === editingTransactionId);
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={transaction.description}
                        onChange={(e) => handleInputChange(e, transaction.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="amount"
                        value={transaction.amount}
                        onChange={(e) => handleInputChange(e, transaction.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        name="type"
                        value={transaction.type}
                        onChange={(e) => handleInputChange(e, transaction.id)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        name="category"
                        value={transaction.category || ''}
                        onChange={(e) => handleInputChange(e, transaction.id)}
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Select a category</option>
                        {categories[transaction.type].map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={transaction.date}
                        onChange={(e) => handleInputChange(e, transaction.id)}
                        required
                        className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                );
              })()}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTransactionId(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Setlists Tab Component
const SetlistsTab = ({ 
  setlists, 
  addSetlist, 
  updateSetlist, 
  deleteSetlist,
  addSongToSetlist,
  updateSongInSetlist,
  deleteSongFromSetlist,
  darkMode 
}) => {
  const [activeSetlistId, setActiveSetlistId] = React.useState(null);
  const [showNewSetlistForm, setShowNewSetlistForm] = React.useState(false);
  const [newSetlistName, setNewSetlistName] = React.useState('');
  const [showAddSongForm, setShowAddSongForm] = React.useState(false);
  const [newSong, setNewSong] = React.useState({
    title: '',
    duration: '',
    key: '',
    notes: ''
  });
  const [editingSongId, setEditingSongId] = React.useState(null);
  
  React.useEffect(() => {
    // Set active setlist to the first one if available and none selected
    if (setlists.length > 0 && !activeSetlistId) {
      setActiveSetlistId(setlists[0].id);
    }
  }, [setlists, activeSetlistId]);
  
  const handleAddSetlist = (e) => {
    e.preventDefault();
    if (newSetlistName.trim()) {
      const newSetlist = addSetlist({ name: newSetlistName.trim() });
      setNewSetlistName('');
      setShowNewSetlistForm(false);
      setActiveSetlistId(newSetlist.id);
    }
  };
  
  const handleAddSong = (e) => {
    e.preventDefault();
    if (newSong.title.trim() && newSong.duration.trim()) {
      addSongToSetlist(activeSetlistId, newSong);
      setNewSong({
        title: '',
        duration: '',
        key: '',
        notes: ''
      });
      setShowAddSongForm(false);
    }
  };
  
  const handleUpdateSong = (e) => {
    e.preventDefault();
    const activeSetlist = setlists.find(s => s.id === activeSetlistId);
    const songToUpdate = activeSetlist.songs.find(song => song.id === editingSongId);
    updateSongInSetlist(activeSetlistId, songToUpdate);
    setEditingSongId(null);
  };
  
  const handleSongInputChange = (e, songId = null) => {
    const { name, value } = e.target;
    
    if (songId) {
      // Updating existing song
      const activeSetlist = setlists.find(s => s.id === activeSetlistId);
      const updatedSongs = activeSetlist.songs.map(song => {
        if (song.id === songId) {
          return { ...song, [name]: value };
        }
        return song;
      });
      
      const updatedSetlist = {
        ...activeSetlist,
        songs: updatedSongs
      };
      
      updateSetlist(updatedSetlist);
    } else {
      // Updating new song form
      setNewSong({ ...newSong, [name]: value });
    }
  };
  
  const handleRenameSetlist = (setlistId) => {
    const newName = prompt('Enter a new name for this setlist');
    if (newName && newName.trim()) {
      const setlistToUpdate = setlists.find(s => s.id === setlistId);
      updateSetlist({
        ...setlistToUpdate,
        name: newName.trim()
      });
    }
  };
  
  const calculateTotalDuration = (songs) => {
    // Format: "MM:SS"
    const totalSeconds = songs.reduce((total, song) => {
      if (!song.duration) return total;
      
      const [minutes, seconds] = song.duration.split(':').map(Number);
      return total + (minutes * 60) + seconds;
    }, 0);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handlePrintSetlist = () => {
    const activeSetlist = setlists.find(s => s.id === activeSetlistId);
    if (!activeSetlist) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeSetlist.name} - Setlist</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${activeSetlist.name}</h1>
          <p>Total duration: ${calculateTotalDuration(activeSetlist.songs)}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Key</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${activeSetlist.songs.map((song, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${song.title}</td>
                  <td>${song.key || '-'}</td>
                  <td>${song.duration}</td>
                  <td>${song.notes || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Printed from BandBrain - ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const activeSetlist = setlists.find(s => s.id === activeSetlistId);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Setlists</h2>
        <button
          onClick={() => setShowNewSetlistForm(!showNewSetlistForm)}
          className={`px-4 py-2 rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >
          {showNewSetlistForm ? 'Cancel' : 'New Setlist'}
        </button>
      </div>
      
      {/* New setlist form */}
      {showNewSetlistForm && (
        <form 
          onSubmit={handleAddSetlist}
          className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
        >
          <div className="flex">
            <input
              type="text"
              value={newSetlistName}
              onChange={(e) => setNewSetlistName(e.target.value)}
              placeholder="Setlist name..."
              required
              className={`flex-grow px-4 py-2 border rounded-l-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600"
            >
              Create
            </button>
          </div>
        </form>
      )}
      
      {/* Setlist selector */}
      {setlists.length === 0 ? (
        <p className={`p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>No setlists yet. Create one to get started!</p>
      ) : (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Your Setlists</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {setlists.map(setlist => (
              <button
                key={setlist.id}
                onClick={() => setActiveSetlistId(setlist.id)}
                className={`px-4 py-2 rounded-md ${
                  activeSetlistId === setlist.id
                    ? 'bg-indigo-500 text-white'
                    : darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {setlist.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active setlist */}
      {activeSetlist && (
        <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
          {/* Setlist header */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">{activeSetlist.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRenameSetlist(activeSetlist.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button
                  onClick={handlePrintSetlist}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <i className="fas fa-print"></i>
                </button>
                <button
                  onClick={() => deleteSetlist(activeSetlist.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm">
                {activeSetlist.songs.length} songs · Total duration: {calculateTotalDuration(activeSetlist.songs)}
              </p>
              <button
                onClick={() => setShowAddSongForm(!showAddSongForm)}
                className={`text-sm px-3 py-1 rounded-md ${
                  darkMode 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {showAddSongForm ? 'Cancel' : 'Add Song'}
              </button>
            </div>
          </div>
          
          {/* Add song form */}
          {showAddSongForm && (
            <form 
              onSubmit={handleAddSong}
              className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newSong.title}
                    onChange={(e) => handleSongInputChange(e)}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    name="duration"
                    value={newSong.duration}
                    onChange={(e) => handleSongInputChange(e)}
                    placeholder="3:45"
                    required
                    pattern="[0-9]{1,2}:[0-9]{2}"
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Key (optional)</label>
                  <input
                    type="text"
                    name="key"
                    value={newSong.key}
                    onChange={(e) => handleSongInputChange(e)}
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    name="notes"
                    value={newSong.notes}
                    onChange={(e) => handleSongInputChange(e)}
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add to Setlist
                </button>
              </div>
            </form>
          )}
          
          {/* Songs list */}
          {activeSetlist.songs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No songs in this setlist yet. Add one to get started!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-10">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-20">Key</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Notes</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                {activeSetlist.songs.map((song, index) => (
                  <tr key={song.id}>
                    {editingSongId === song.id ? (
                      <td colSpan="6" className="px-6 py-3">
                        <form onSubmit={handleUpdateSong}>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Title</label>
                              <input
                                type="text"
                                name="title"
                                value={song.title}
                                onChange={(e) => handleSongInputChange(e, song.id)}
                                required
                                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Duration</label>
                              <input
                                type="text"
                                name="duration"
                                value={song.duration}
                                onChange={(e) => handleSongInputChange(e, song.id)}
                                required
                                pattern="[0-9]{1,2}:[0-9]{2}"
                                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Key</label>
                              <input
                                type="text"
                                name="key"
                                value={song.key || ''}
                                onChange={(e) => handleSongInputChange(e, song.id)}
                                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Notes</label>
                              <input
                                type="text"
                                name="notes"
                                value={song.notes || ''}
                                onChange={(e) => handleSongInputChange(e, song.id)}
                                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingSongId(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{song.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{song.key || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{song.duration}</td>
                        <td className="px-6 py-4 text-sm">{song.notes || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <button 
                            onClick={() => setEditingSongId(song.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => deleteSongFromSetlist(activeSetlist.id, song.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('events');
  const [user, setUser] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [setlists, setSetlists] = React.useState([]);
  const [darkMode, setDarkMode] = React.useState(false);

  // Load data from localStorage on initial render
  React.useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem('bandbrainUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // Load all data
      loadData();
    }

    // Check dark mode preference
    const storedDarkMode = localStorage.getItem('bandbrainDarkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  // Apply dark mode class to body
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#f7f7f7';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#f7f7f7';
      document.body.style.color = '#333';
    }
    localStorage.setItem('bandbrainDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Data loading helper function
  const loadData = () => {
    // Load users
    const storedUsers = localStorage.getItem('bandbrainUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Default band members if none exist
      const defaultUsers = [
        { id: uuid.v4(), name: 'Demo User', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Lead Guitar' }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('bandbrainUsers', JSON.stringify(defaultUsers));
    }

    // Load events
    const storedEvents = localStorage.getItem('bandbrainEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    // Load tasks
    const storedTasks = localStorage.getItem('bandbrainTasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    // Load notes
    const storedNotes = localStorage.getItem('bandbrainNotes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }

    // Load transactions
    const storedTransactions = localStorage.getItem('bandbrainTransactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    // Load setlists
    const storedSetlists = localStorage.getItem('bandbrainSetlists');
    if (storedSetlists) {
      setSetlists(JSON.parse(storedSetlists));
    }
  };

  // Login handler
  const handleLogin = (username, password) => {
    // For demo purposes, any non-empty username/password will work
    if (username && password) {
      // Create a user if it doesn't exist
      let currentUsers = JSON.parse(localStorage.getItem('bandbrainUsers') || '[]');
      let loggedInUser = currentUsers.find(u => u.name === username);
      
      if (!loggedInUser) {
        loggedInUser = {
          id: uuid.v4(),
          name: username,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          role: 'Band Member'
        };
        currentUsers.push(loggedInUser);
        localStorage.setItem('bandbrainUsers', JSON.stringify(currentUsers));
      }

      setUser(loggedInUser);
      localStorage.setItem('bandbrainUser', JSON.stringify(loggedInUser));
      setIsAuthenticated(true);
      loadData();
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('bandbrainUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  // CRUD handlers for Events
  const addEvent = (event) => {
    const newEvent = { id: uuid.v4(), ...event };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('bandbrainEvents', JSON.stringify(updatedEvents));
    return newEvent;
  };

  const updateEvent = (updatedEvent) => {
    const updatedEvents = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    localStorage.setItem('bandbrainEvents', JSON.stringify(updatedEvents));
  };

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('bandbrainEvents', JSON.stringify(updatedEvents));
  };

  // CRUD handlers for Tasks
  const addTask = (task) => {
    const newTask = { id: uuid.v4(), completed: false, ...task };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('bandbrainTasks', JSON.stringify(updatedTasks));
    return newTask;
  };

  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('bandbrainTasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('bandbrainTasks', JSON.stringify(updatedTasks));
  };

  // CRUD handlers for Notes
  const addNote = (note) => {
    const newNote = { 
      id: uuid.v4(), 
      createdAt: new Date().toISOString(),
      author: user.name,
      ...note 
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('bandbrainNotes', JSON.stringify(updatedNotes));
    return newNote;
  };

  const updateNote = (updatedNote) => {
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('bandbrainNotes', JSON.stringify(updatedNotes));
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('bandbrainNotes', JSON.stringify(updatedNotes));
  };

  // CRUD handlers for Transactions
  const addTransaction = (transaction) => {
    const newTransaction = { id: uuid.v4(), date: new Date().toISOString().split('T')[0], ...transaction };
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('bandbrainTransactions', JSON.stringify(updatedTransactions));
    return newTransaction;
  };

  const updateTransaction = (updatedTransaction) => {
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    setTransactions(updatedTransactions);
    localStorage.setItem('bandbrainTransactions', JSON.stringify(updatedTransactions));
  };

  const deleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
    setTransactions(updatedTransactions);
    localStorage.setItem('bandbrainTransactions', JSON.stringify(updatedTransactions));
  };

  // CRUD handlers for Setlists
  const addSetlist = (setlist) => {
    const newSetlist = { id: uuid.v4(), songs: [], ...setlist };
    const updatedSetlists = [...setlists, newSetlist];
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
    return newSetlist;
  };

  const updateSetlist = (updatedSetlist) => {
    const updatedSetlists = setlists.map(setlist =>
      setlist.id === updatedSetlist.id ? updatedSetlist : setlist
    );
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
  };

  const deleteSetlist = (setlistId) => {
    const updatedSetlists = setlists.filter(setlist => setlist.id !== setlistId);
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
  };

  // Add song to setlist
  const addSongToSetlist = (setlistId, song) => {
    const newSong = { id: uuid.v4(), ...song };
    const updatedSetlists = setlists.map(setlist => {
      if (setlist.id === setlistId) {
        return {
          ...setlist,
          songs: [...setlist.songs, newSong]
        };
      }
      return setlist;
    });
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
    return newSong;
  };

  // Update song in setlist
  const updateSongInSetlist = (setlistId, updatedSong) => {
    const updatedSetlists = setlists.map(setlist => {
      if (setlist.id === setlistId) {
        return {
          ...setlist,
          songs: setlist.songs.map(song => 
            song.id === updatedSong.id ? updatedSong : song
          )
        };
      }
      return setlist;
    });
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
  };

  // Delete song from setlist
  const deleteSongFromSetlist = (setlistId, songId) => {
    const updatedSetlists = setlists.map(setlist => {
      if (setlist.id === setlistId) {
        return {
          ...setlist,
          songs: setlist.songs.filter(song => song.id !== songId)
        };
      }
      return setlist;
    });
    setSetlists(updatedSetlists);
    localStorage.setItem('bandbrainSetlists', JSON.stringify(updatedSetlists));
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Main app layout
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">BandBrain</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="flex items-center">
              <img 
                src={user?.avatar || 'https://i.pravatar.cc/150'} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
              <div className="ml-2">
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm px-3 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'events' && (
          <EventsTab 
            events={events} 
            addEvent={addEvent} 
            updateEvent={updateEvent} 
            deleteEvent={deleteEvent}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksTab 
            tasks={tasks} 
            users={users}
            addTask={addTask} 
            updateTask={updateTask} 
            deleteTask={deleteTask}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab 
            notes={notes} 
            addNote={addNote} 
            updateNote={updateNote} 
            deleteNote={deleteNote}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetTab 
            transactions={transactions} 
            addTransaction={addTransaction} 
            updateTransaction={updateTransaction} 
            deleteTransaction={deleteTransaction}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'setlists' && (
          <SetlistsTab 
            setlists={setlists} 
            addSetlist={addSetlist} 
            updateSetlist={updateSetlist} 
            deleteSetlist={deleteSetlist}
            addSongToSetlist={addSongToSetlist}
            updateSongInSetlist={updateSongInSetlist}
            deleteSongFromSetlist={deleteSongFromSetlist}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Bottom tab navigation */}
      <footer className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-around">
          <button 
            onClick={() => setActiveTab('events')} 
            className={`flex flex-col items-center p-3 w-full ${activeTab === 'events' ? 'tab-active' : ''}`}
          >
            <i className="fas fa-calendar-alt text-xl"></i>
            <span className="text-xs mt-1">Events</span>
          </button>
          <button 
            onClick={() => setActiveTab('tasks')} 
            className={`flex flex-col items-center p-3 w-full ${activeTab === 'tasks' ? 'tab-active' : ''}`}
          >
            <i className="fas fa-tasks text-xl"></i>
            <span className="text-xs mt-1">Tasks</span>
          </button>
          <button 
            onClick={() => setActiveTab('notes')} 
            className={`flex flex-col items-center p-3 w-full ${activeTab === 'notes' ? 'tab-active' : ''}`}
          >
            <i className="fas fa-sticky-note text-xl"></i>
            <span className="text-xs mt-1">Notes</span>
          </button>
          <button 
            onClick={() => setActiveTab('budget')} 
            className={`flex flex-col items-center p-3 w-full ${activeTab === 'budget' ? 'tab-active' : ''}`}
          >
            <i className="fas fa-dollar-sign text-xl"></i>
            <span className="text-xs mt-1">Budget</span>
          </button>
          <button 
            onClick={() => setActiveTab('setlists')} 
            className={`flex flex-col items-center p-3 w-full ${activeTab === 'setlists' ? 'tab-active' : ''}`}
          >
            <i className="fas fa-music text-xl"></i>
            <span className="text-xs mt-1">Setlists</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

// Render the App component
ReactDOM.render(<App />, document.getElementById('root')); 