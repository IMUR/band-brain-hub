<script lang="ts">
  // Svelte 5 runes, TypeScript, state management, components, logic, data layer (IndexedDB) will go here
  import { v4 as uuidv4 } from 'uuid';
  import { openDB, type IDBPDatabase } from 'idb';

  // === Types ===
  interface User {
    id: string;
    name: string;
    // Add other user properties if needed (e.g., avatar, role)
  }

  interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string; // HH:MM
    location?: string;
    type: 'gig' | 'rehearsal' | 'other';
    description?: string;
  }

  interface Task {
    id: string;
    title: string;
    completed: boolean;
    assignee?: string; // User ID or name
  }

  interface Note {
    id: string;
    title: string;
    content: string;
    author: string; // User ID or name
    createdAt: string; // ISO date string
  }

  interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: string; // YYYY-MM-DD
  }

  interface Song {
    id: string;
    title: string;
    duration: string; // MM:SS
    key?: string;
    tempo?: number;
    notes?: string;
  }

  interface Setlist {
    id: string;
    name: string;
    songs: Song[];
  }

  type StoreName =
    | 'users'
    | 'events'
    | 'tasks'
    | 'notes'
    | 'transactions'
    | 'setlists';

  // === Database Setup ===
  let db = $state<IDBPDatabase | null>(null);
  const DB_NAME = 'band-brain-hub-db';
  const DB_VERSION = 1;

  // Initialize database on component mount
  async function initDB() {
    try {
      db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('events')) {
            const store = db.createObjectStore('events', { keyPath: 'id' });
            store.createIndex('date', 'date'); // Index for sorting by date
          }
          if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks', { keyPath: 'id' });
            // Add indexes if needed, e.g., store.createIndex('completed', 'completed');
          }
          if (!db.objectStoreNames.contains('notes')) {
            const store = db.createObjectStore('notes', { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt');
          }
          if (!db.objectStoreNames.contains('transactions')) {
            const store = db.createObjectStore('transactions', { keyPath: 'id' });
            store.createIndex('date', 'date');
          }
          if (!db.objectStoreNames.contains('setlists')) {
            db.createObjectStore('setlists', { keyPath: 'id' });
          }
        },
      });
      console.log('Database initialized:', db);
      
      // Load user from local storage after DB is initialized
      loadUserFromLocalStorage();
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  // Call initDB immediately on component creation
  initDB();

  // === Generic Data Access Functions ===
  async function getAll<T>(storeName: StoreName): Promise<T[]> {
    if (!db) return [];
    return db.getAll(storeName);
  }

  async function add<T extends { id: string }>(storeName: StoreName, item: Omit<T, 'id'>): Promise<T> {
    if (!db) throw new Error('Database not initialized');
    const newItem = { ...item, id: uuidv4() } as T;
    await db.add(storeName, newItem);
    return newItem;
  }

  async function update<T>(storeName: StoreName, item: T): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.put(storeName, item);
  }

  async function remove(storeName: StoreName, id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.delete(storeName, id);
  }

  // === Authentication ===
  let isAuthenticated = $state(false);
  let currentUser = $state<User | null>(null);

  // Function to load user from localStorage
  function loadUserFromLocalStorage() {
    const storedUser = localStorage.getItem('bandbrainUser');
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        isAuthenticated = true;
        // Load initial data when user is authenticated
        loadAllData();
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('bandbrainUser');
      }
    }
  }

  function handleLogin(username: string, password: string = "") {
    // Simple demo login: finds or creates user
    // Password is not checked in this demo, but we store it for UX purposes
    if (!db) return;
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    store.getAll().then(users => {
      let user = users.find(u => u.name === username);
      if (!user) {
        user = { id: uuidv4(), name: username };
        store.add(user);
      }
      currentUser = user;
      isAuthenticated = true;
      localStorage.setItem('bandbrainUser', JSON.stringify(user));
    });
  }

  function handleLogout() {
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('bandbrainUser');
  }

  // === Reactive Data Stores ===
  let events = $state<Event[]>([]);
  let tasks = $state<Task[]>([]);
  let notes = $state<Note[]>([]);
  let transactions = $state<Transaction[]>([]);
  let setlists = $state<Setlist[]>([]);
  let users = $state<User[]>([]); // Potentially store band members here

  // Load all data function
  async function loadAllData() {
    if (db && isAuthenticated) {
      console.log('Loading data...');
      try {
        events = await getAll<Event>('events');
        tasks = await getAll<Task>('tasks');
        notes = await getAll<Note>('notes');
        transactions = await getAll<Transaction>('transactions');
        setlists = await getAll<Setlist>('setlists');
        users = await getAll<User>('users');
        console.log('Data loaded:', { events, tasks, notes, transactions, setlists, users });
        console.log('Database status:', db ? 'Connected' : 'Not connected');
        console.log('Authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        if (currentUser) {
          console.log('Current user:', currentUser.name);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }

  // Create a reactive dependency on db and isAuthenticated
  $effect(() => {
    if (db && isAuthenticated) {
      loadAllData();
    }
  });

  // === CRUD Operations (Using Generic Functions) ===

  // Events
  async function addEvent(event: Omit<Event, 'id'>) {
    const newEvent = await add<Event>('events', event);
    events = [...events, newEvent];
  }
  async function updateEvent(event: Event) {
    await update<Event>('events', event);
    events = events.map(e => e.id === event.id ? event : e);
  }
  async function deleteEvent(id: string) {
    await remove('events', id);
    events = events.filter(e => e.id !== id);
  }

  // Tasks
  async function addTask(task: Omit<Task, 'id' | 'completed'>) {
    const newTask = await add<Task>('tasks', { ...task, completed: false });
    tasks = [...tasks, newTask];
  }
  async function updateTask(task: Task) {
    await update<Task>('tasks', task);
    tasks = tasks.map(t => t.id === task.id ? task : t);
  }
  async function deleteTask(id: string) {
    await remove('tasks', id);
    tasks = tasks.filter(t => t.id !== id);
  }
  async function toggleTaskCompletion(id: string) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const updatedTask = { ...task, completed: !task.completed };
        await updateTask(updatedTask);
    }
  }

  // Notes
  async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'author'>) {
    if (!currentUser) return;
    const newNote = await add<Note>('notes', {
      ...note,
      createdAt: new Date().toISOString(),
      author: currentUser.name
    });
    notes = [...notes, newNote];
  }
  async function updateNote(note: Note) {
    await update<Note>('notes', note);
    notes = notes.map(n => n.id === note.id ? note : n);
  }
  async function deleteNote(id: string) {
    await remove('notes', id);
    notes = notes.filter(n => n.id !== id);
  }

  // Transactions
  async function addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction = await add<Transaction>('transactions', transaction);
    transactions = [...transactions, newTransaction];
  }
  async function updateTransaction(transaction: Transaction) {
    await update<Transaction>('transactions', transaction);
    transactions = transactions.map(t => t.id === transaction.id ? transaction : t);
  }
  async function deleteTransaction(id: string) {
    await remove('transactions', id);
    transactions = transactions.filter(t => t.id !== id);
  }

  // Setlists & Songs
  async function addSetlist(setlist: Omit<Setlist, 'id' | 'songs'>) {
    const newSetlist = await add<Setlist>('setlists', { ...setlist, songs: [] });
    setlists = [...setlists, newSetlist];
    return newSetlist; // Return the new setlist with ID
  }
  async function updateSetlist(setlist: Setlist) {
    await update<Setlist>('setlists', setlist);
    setlists = setlists.map(s => s.id === setlist.id ? setlist : s);
  }
  async function deleteSetlist(id: string) {
    await remove('setlists', id);
    setlists = setlists.filter(s => s.id !== id);
  }
  async function addSongToSetlist(setlistId: string, song: Omit<Song, 'id'>) {
    const setlist = setlists.find(s => s.id === setlistId);
    if (setlist) {
        const newSong = { ...song, id: uuidv4() };
        const updatedSetlist = { ...setlist, songs: [...setlist.songs, newSong] };
        await updateSetlist(updatedSetlist);
    }
  }
  async function updateSongInSetlist(setlistId: string, updatedSong: Song) {
     const setlist = setlists.find(s => s.id === setlistId);
    if (setlist) {
        const updatedSongs = setlist.songs.map(song => song.id === updatedSong.id ? updatedSong : song);
        const updatedSetlist = { ...setlist, songs: updatedSongs };
        await updateSetlist(updatedSetlist);
    }
  }
  async function deleteSongFromSetlist(setlistId: string, songId: string) {
    const setlist = setlists.find(s => s.id === setlistId);
    if (setlist) {
        const updatedSongs = setlist.songs.filter(song => song.id !== songId);
        const updatedSetlist = { ...setlist, songs: updatedSongs };
        await updateSetlist(updatedSetlist);
    }
  }

  // === UI State ===
  type Tab = 'events' | 'tasks' | 'notes' | 'budget' | 'setlists';
  let activeTab = $state<Tab>('events');

  // Task specific UI state
  let showAddTaskForm = $state(false);
  let newTaskTitle = $state('');
  let editingTaskId = $state<string | null>(null);
  let editingTaskTitle = $state('');

  // Event specific UI state
  let showAddEventForm = $state(false);
  const defaultNewEvent = () => ({ 
    title: '', 
    date: new Date().toISOString().split('T')[0], 
    time: '', 
    location: '', 
    type: 'rehearsal' as Event['type'], 
    description: '' 
  });
  let newEvent = $state(defaultNewEvent());
  let editingEventId = $state<string | null>(null);
  let editingEvent = $state<Event | null>(null);

  // === Component Logic Placeholder ===
  // TODO: Implement UI components for each tab (EventsTab, TasksTab, etc.)
  //       These components will receive data and CRUD functions as props/context.

</script>

{#if !isAuthenticated}
  <!-- Login Component -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 transform transition-all hover:scale-[1.01]">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">🎸 Band Brain Hub</h1>
        <p class="text-gray-600 mb-8">Your band's digital command center</p>
      </div>
      <form 
        class="space-y-6" 
        onsubmit={(event: SubmitEvent) => { 
          event.preventDefault(); 
          const form = event.target as HTMLFormElement;
          const username = form.username.value;
          const password = form.password?.value || "";
          handleLogin(username, password); 
        }}
      >
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input 
            id="username" 
            name="username" 
            type="text" 
            required 
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter your username"
          >
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Enter any password (demo)"
          >
          <p class="mt-1 text-xs text-gray-500 italic">For this demo, any password will work</p>
        </div>
        
        <button 
          type="submit" 
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:shadow-xl"
        >
          Sign In / Register
        </button>
        
        <p class="text-center text-xs text-gray-500">Enter any username/password to create or access an account</p>
      </form>
    </div>
  </div>
{:else}
  <!-- Main App Layout -->
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16"> 

    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">🎸 Band Brain Hub</h1>
        <div class="flex items-center space-x-4">
          {#if currentUser}
            <span class="text-sm font-medium">Welcome, {currentUser.name}!</span>
          {/if}
          <button
            onclick={() => handleLogout()}
            class="text-sm px-4 py-2 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 shadow-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <!-- Conditional Rendering Based on Active Tab -->
      {#if activeTab === 'events'}
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Events</h2>
          
          <!-- Quick Add Button / Form Toggle -->
          <div class="mb-6">
            <button 
              onclick={() => { 
                showAddEventForm = !showAddEventForm; 
                newEvent = defaultNewEvent(); 
                editingEventId = null; 
              }}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i class={`fas ${showAddEventForm ? 'fa-times' : 'fa-plus'} mr-2`}></i> {showAddEventForm ? 'Cancel' : 'Add Event'}
            </button>
          </div>

          <!-- Add Event Form -->
          {#if showAddEventForm}
            <form 
              class="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner"
              onsubmit={(e) => {
                e.preventDefault();
                if (newEvent.title.trim()) {
                  addEvent(newEvent);
                  newEvent = defaultNewEvent();
                  showAddEventForm = false;
                }
              }}
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="newEventTitle" class="block text-sm font-medium mb-1">Title</label>
                  <input id="newEventTitle" type="text" name="title" bind:value={newEvent.title} required class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                </div>
                <div>
                  <label for="newEventType" class="block text-sm font-medium mb-1">Type</label>
                  <select id="newEventType" name="type" bind:value={newEvent.type} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500">
                    <option value="gig">Gig</option>
                    <option value="rehearsal">Rehearsal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label for="newEventDate" class="block text-sm font-medium mb-1">Date</label>
                  <input id="newEventDate" type="date" name="date" bind:value={newEvent.date} required class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                </div>
                <div>
                  <label for="newEventTime" class="block text-sm font-medium mb-1">Time (Optional)</label>
                  <input id="newEventTime" type="time" name="time" bind:value={newEvent.time} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                </div>
                <div class="md:col-span-2">
                  <label for="newEventLocation" class="block text-sm font-medium mb-1">Location (Optional)</label>
                  <input id="newEventLocation" type="text" name="location" bind:value={newEvent.location} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                </div>
                <div class="md:col-span-2">
                  <label for="newEventDescription" class="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea id="newEventDescription" name="description" bind:value={newEvent.description} rows="3" class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"></textarea>
                </div>
              </div>
              <div class="flex justify-end">
                <button 
                  type="submit"
                  class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
                >
                  Save Event
                </button>
              </div>
            </form>
          {/if}
          
          <!-- Upcoming Events Section -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upcoming Events</h3>
            
            {#if events.length === 0 && !showAddEventForm}
              <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                <i class="fas fa-calendar-alt text-gray-400 text-3xl mb-2"></i>
                <p class="text-gray-500 dark:text-gray-400">No events yet! Add your first event to get started.</p>
              </div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each events as event (event.id)}
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                    {#if editingEventId === event.id && editingEvent}
                      <!-- Edit Event Form (Ensure editingEvent is not null) -->
                      <form 
                        class="space-y-3"
                        onsubmit={(e) => {
                          e.preventDefault();
                          if (editingEvent && editingEvent.title.trim()) {
                            updateEvent(editingEvent);
                            editingEventId = null;
                            editingEvent = null;
                          }
                        }}
                      >
                        <label class="sr-only" for={`editEventTitle-${event.id}`}>Title</label>
                        <input id={`editEventTitle-${event.id}`} type="text" name="title" bind:value={editingEvent.title} required class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                        <label class="sr-only" for={`editEventType-${event.id}`}>Type</label>
                        <select id={`editEventType-${event.id}`} name="type" bind:value={editingEvent.type} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500">
                          <option value="gig">Gig</option>
                          <option value="rehearsal">Rehearsal</option>
                          <option value="other">Other</option>
                        </select>
                        <label class="sr-only" for={`editEventDate-${event.id}`}>Date</label>
                        <input id={`editEventDate-${event.id}`} type="date" name="date" bind:value={editingEvent.date} required class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                        <label class="sr-only" for={`editEventTime-${event.id}`}>Time</label>
                        <input id={`editEventTime-${event.id}`} type="time" name="time" bind:value={editingEvent.time} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                        <label class="sr-only" for={`editEventLocation-${event.id}`}>Location</label>
                        <input id={`editEventLocation-${event.id}`} type="text" name="location" bind:value={editingEvent.location} class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500" />
                        <label class="sr-only" for={`editEventDescription-${event.id}`}>Description</label>
                        <textarea id={`editEventDescription-${event.id}`} name="description" bind:value={editingEvent.description} rows="3" class="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"></textarea>
                        <div class="flex justify-end space-x-2">
                          <button type="button" onclick={() => { editingEventId = null; editingEvent = null; }} class="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm">Cancel</button>
                          <button type="submit" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Save</button>
                        </div>
                      </form>
                    {:else}
                      <!-- Display Event -->
                      <div class="flex justify-between mb-2 items-start">
                        <span class={`px-2 py-1 rounded text-xs font-semibold ${event.type === 'gig' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : event.type === 'rehearsal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                           <button 
                            onclick={() => { 
                              editingEventId = event.id; 
                              editingEvent = { ...event }; // Clone event for editing
                              showAddEventForm = false;
                            }}
                            class="text-gray-400 hover:text-blue-500 bg-white dark:bg-gray-800 rounded-full p-1 shadow"
                            aria-label="Edit Event"
                           >
                             <i class="fas fa-edit w-3 h-3"></i>
                           </button>
                           <button 
                             onclick={() => deleteEvent(event.id)}
                             class="text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-full p-1 shadow"
                             aria-label="Delete Event"
                           >
                             <i class="fas fa-trash w-3 h-3"></i>
                           </button>
                         </div>
                      </div>
                      <h4 class="text-lg font-semibold">{event.title}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <i class="fas fa-calendar-day mr-2"></i>
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {event.time && ` @ ${event.time}`}
                      </p>
                      {#if event.location}
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          <i class="fas fa-map-marker-alt mr-2"></i>
                          {event.location}
                        </p>
                      {/if}
                      {#if event.description}
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">{event.description}</p>
                      {/if}
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
          
          <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-4 rounded-lg overflow-auto mt-4">{JSON.stringify(events, null, 2)}</pre>
        </div>
      {:else if activeTab === 'tasks'}
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Tasks</h2>
          
          <!-- Quick Add Button / Form Toggle -->
          <div class="mb-6">
            <button 
              onclick={() => { showAddTaskForm = !showAddTaskForm; newTaskTitle = ''; editingTaskId = null; }}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i class={`fas ${showAddTaskForm ? 'fa-times' : 'fa-plus'} mr-2`}></i> {showAddTaskForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          <!-- Add Task Form -->
          {#if showAddTaskForm}
            <form 
              class="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
              onsubmit={(e) => {
                e.preventDefault();
                if (newTaskTitle.trim()) {
                  addTask({ title: newTaskTitle });
                  newTaskTitle = '';
                  showAddTaskForm = false;
                }
              }}
            >
              <div class="flex items-center space-x-3">
                <input 
                  type="text" 
                  bind:value={newTaskTitle}
                  placeholder="Enter new task title"
                  required
                  class="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
                <button 
                  type="submit"
                  class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          {/if}
          
          {#if tasks.length === 0 && !showAddTaskForm}
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <i class="fas fa-tasks text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 dark:text-gray-400">No tasks yet! Add your first task to get started.</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each tasks as task (task.id)}
                <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm group">
                  {#if editingTaskId === task.id}
                    <!-- Edit Task Form -->
                    <form 
                      class="flex-grow flex items-center space-x-3"
                      onsubmit={(e) => {
                        e.preventDefault();
                        if (editingTaskTitle.trim()) {
                          updateTask({ ...task, title: editingTaskTitle });
                          editingTaskId = null;
                        }
                      }}
                    >
                       <input 
                        type="checkbox" 
                        checked={task.completed}
                        onchange={() => toggleTaskCompletion(task.id)}
                        class="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:accent-indigo-500"
                      />
                      <input 
                        type="text" 
                        bind:value={editingTaskTitle}
                        required
                        class="flex-grow px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                      <button 
                        type="submit"
                        class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                        aria-label="Save Task"
                      >
                        <i class="fas fa-save"></i>
                      </button>
                       <button 
                        type="button"
                        onclick={() => editingTaskId = null}
                        class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                        aria-label="Cancel Edit"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </form>
                  {:else}
                    <!-- Display Task -->
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onchange={() => toggleTaskCompletion(task.id)}
                      class="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:accent-indigo-500"
                    />
                    <button 
                      type="button"
                      class={`ml-3 flex-grow text-left ${task.completed ? 'line-through text-gray-400' : ''}`}
                      onclick={() => { editingTaskId = task.id; editingTaskTitle = task.title; showAddTaskForm = false; }}
                      aria-label={`Edit task ${task.title}`}
                    >
                      {task.title}
                    </button>
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                      <button 
                        onclick={() => { editingTaskId = task.id; editingTaskTitle = task.title; showAddTaskForm = false; }}
                        class="text-gray-400 hover:text-blue-500"
                        aria-label="Edit Task"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        onclick={() => deleteTask(task.id)}
                        class="text-gray-400 hover:text-red-500"
                        aria-label="Delete Task"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
          
          <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-4 rounded-lg overflow-auto mt-4">{JSON.stringify(tasks, null, 2)}</pre>
        </div>
      {:else if activeTab === 'notes'}
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Notes</h2>
          
          <!-- Quick Add Button -->
          <div class="mb-6">
            <button 
              onclick={() => alert('Add Note feature coming soon!')}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i class="fas fa-plus mr-2"></i> Add Note
            </button>
          </div>
          
          {#if notes.length === 0}
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <i class="fas fa-sticky-note text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 dark:text-gray-400">No notes yet! Add your first note to get started.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each notes as note}
                <div class="bg-yellow-50 dark:bg-gray-700 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 class="font-bold text-lg mb-1">{note.title}</h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                    <span>By {note.author}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
          
          <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-4 rounded-lg overflow-auto mt-4">{JSON.stringify(notes, null, 2)}</pre>
        </div>
      {:else if activeTab === 'budget'}
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Budget</h2>
          
          <!-- Quick Add Button -->
          <div class="mb-6">
            <button 
              onclick={() => alert('Add Transaction feature coming soon!')}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i class="fas fa-plus mr-2"></i> Add Transaction
            </button>
          </div>
          
          {#if transactions.length === 0}
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <i class="fas fa-dollar-sign text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 dark:text-gray-400">No transactions yet! Add your first transaction to get started.</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {#each transactions as transaction}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {transaction.description}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {transaction.category || '-'}
                      </td>
                      <td class={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          
          <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-4 rounded-lg overflow-auto mt-4">{JSON.stringify(transactions, null, 2)}</pre>
        </div>
      {:else if activeTab === 'setlists'}
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">Setlists</h2>
          
          <!-- Quick Add Button -->
          <div class="mb-6">
            <button 
              onclick={() => alert('Add Setlist feature coming soon!')}
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i class="fas fa-plus mr-2"></i> Add Setlist
            </button>
          </div>
          
          {#if setlists.length === 0}
            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
              <i class="fas fa-music text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 dark:text-gray-400">No setlists yet! Create your first setlist to get started.</p>
            </div>
          {:else}
            <div class="space-y-6">
              {#each setlists as setlist}
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                  <h3 class="text-xl font-semibold mb-2">{setlist.name}</h3>
                  
                  {#if setlist.songs.length === 0}
                    <p class="text-gray-500 dark:text-gray-400 italic">No songs added yet</p>
                  {:else}
                    <div class="space-y-2 mt-4">
                      {#each setlist.songs as song, index}
                        <div class="flex items-center p-2 bg-white dark:bg-gray-800 rounded">
                          <span class="w-8 text-center text-gray-500 dark:text-gray-400">{index + 1}</span>
                          <span class="flex-grow font-medium">{song.title}</span>
                          <span class="text-gray-500 dark:text-gray-400 mx-4">{song.duration}</span>
                          {#if song.key}
                            <span class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">{song.key}</span>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
          
          <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-4 rounded-lg overflow-auto mt-4">{JSON.stringify(setlists, null, 2)}</pre>
        </div>
      {/if}
    </main>

    <!-- Bottom Navigation -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <nav class="flex justify-around">
        {#each [
          { name: 'events' as Tab, icon: 'fa-calendar-alt', label: 'Events' },
          { name: 'tasks' as Tab, icon: 'fa-tasks', label: 'Tasks' },
          { name: 'notes' as Tab, icon: 'fa-sticky-note', label: 'Notes' },
          { name: 'budget' as Tab, icon: 'fa-dollar-sign', label: 'Budget' },
          { name: 'setlists' as Tab, icon: 'fa-music', label: 'Setlists' }
        ] as tab}
          {@const isActive = activeTab === tab.name}
          <button
            onclick={() => { activeTab = tab.name; }}
            class={`flex flex-col items-center p-2 w-full ${isActive ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <i class={`fas ${tab.icon} text-xl`}></i>
            <span class="text-xs mt-1">{tab.label}</span>
          </button>
        {/each}
      </nav>
    </footer>

  </div>
{/if}

<style>
  /* Add any global or component-specific styles here if needed */
  /* Tailwind handles most styling via classes */

  /* Simple transition for tab buttons */
  button {
    transition: all 0.2s ease-in-out;
  }
  
  /* Smooth transitions for all elements */
  * {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-duration: 150ms;
  }
  
  /* Nice box shadow for cards */
  .shadow-md {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
</style> 