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

  async function initDB() {
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
  }

  $effect(() => {
    initDB();
  });

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

  // Check local storage on initial load
  $effect(() => {
    const storedUser = localStorage.getItem('bandbrainUser');
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        isAuthenticated = true;
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem('bandbrainUser');
      }
    }
  });

  function handleLogin(username: string) {
    // Simple demo login: finds or creates user
    // In a real app, this would involve password checking
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

  // Load initial data when DB is ready and user is authenticated
  $effect(() => {
    async function loadAllData() {
      if (db && isAuthenticated) {
        console.log('Loading data...');
        events = await getAll<Event>('events');
        tasks = await getAll<Task>('tasks');
        notes = await getAll<Note>('notes');
        transactions = await getAll<Transaction>('transactions');
        setlists = await getAll<Setlist>('setlists');
        users = await getAll<User>('users');
        console.log('Data loaded:', { events, tasks, notes, transactions, setlists, users });
      }
    }
    loadAllData();
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

  // === Component Logic Placeholder ===
  // TODO: Implement UI components for each tab (EventsTab, TasksTab, etc.)
  //       These components will receive data and CRUD functions as props/context.

</script>

{#if !isAuthenticated}
  <!-- Login Component Placeholder -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Band Brain Hub</h1>
        <p class="text-gray-600 mb-6">Your band's digital command center</p>
      </div>
      <form class="space-y-6" onsubmit="{event => { event.preventDefault(); handleLogin(event.target.username.value); }}">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input id="username" name="username" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <!-- Simple login - no password for demo -->
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Sign In / Register
        </button>
        <p class="text-center text-xs text-gray-500">Enter any username to log in or create an account.</p>
      </form>
    </div>
  </div>
{:else}
  <!-- Main App Layout -->
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16"> {/* Added pb-16 for footer */}

    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">🎸 Band Brain Hub</h1>
        <div class="flex items-center space-x-4">
          {#if currentUser}
            <span class="text-sm font-medium">Welcome, {currentUser.name}!</span>
          {/if}
          <button
            onclick={handleLogout}
            class="text-sm px-3 py-1 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
          >
            Logout
          </button>
          <!-- Dark Mode Toggle Placeholder -->
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow container mx-auto px-4 py-6">
      <!-- Conditional Rendering Based on Active Tab -->
      {#if activeTab === 'events'}
        <h2 class="text-2xl font-bold mb-4">Events</h2>
        <!-- Events Component Placeholder -->
        <p>Events component goes here...</p>
        <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">{JSON.stringify(events, null, 2)}</pre>
      {:else if activeTab === 'tasks'}
        <h2 class="text-2xl font-bold mb-4">Tasks</h2>
        <!-- Tasks Component Placeholder -->
        <p>Tasks component goes here...</p>
        <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">{JSON.stringify(tasks, null, 2)}</pre>
      {:else if activeTab === 'notes'}
        <h2 class="text-2xl font-bold mb-4">Notes</h2>
        <!-- Notes Component Placeholder -->
        <p>Notes component goes here...</p>
         <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">{JSON.stringify(notes, null, 2)}</pre>
      {:else if activeTab === 'budget'}
        <h2 class="text-2xl font-bold mb-4">Budget</h2>
        <!-- Budget Component Placeholder -->
        <p>Budget component goes here...</p>
         <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">{JSON.stringify(transactions, null, 2)}</pre>
      {:else if activeTab === 'setlists'}
        <h2 class="text-2xl font-bold mb-4">Setlists</h2>
        <!-- Setlists Component Placeholder -->
        <p>Setlists component goes here...</p>
         <pre class="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">{JSON.stringify(setlists, null, 2)}</pre>
      {/if}
    </main>

    <!-- Bottom Navigation -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
      <nav class="flex justify-around">
        {@const tabs: { name: Tab; icon: string; label: string }[] = [
          { name: 'events', icon: 'fa-calendar-alt', label: 'Events' },
          { name: 'tasks', icon: 'fa-tasks', label: 'Tasks' },
          { name: 'notes', icon: 'fa-sticky-note', label: 'Notes' },
          { name: 'budget', icon: 'fa-dollar-sign', label: 'Budget' },
          { name: 'setlists', icon: 'fa-music', label: 'Setlists' },
        ]}
        {#each tabs as tab}
          {@const isActive = activeTab === tab.name}
          <button
            onclick={() => { activeTab = tab.name; }}
            class={`flex flex-col items-center p-2 w-full ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
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
  footer button {
    transition: color 0.2s ease-in-out;
  }
</style> 