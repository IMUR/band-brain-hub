# BandBrain: Single-File MVP Blueprint

## Project Vision

BandBrain is a digital hub for bands to manage their creative workflow with a radically simplified architecture: one file for the entire application using React, TypeScript, and a local JSON-based data store. This document outlines the critical implementation details for rapid launch.

![BandBrain Concept](https://i.imgur.com/zBhTJ7Z.png)

## Core Architecture

### Single-File React Application

The entire application lives in a single `App.tsx` file with the following structure:

```
App.tsx
├── Type Definitions
├── JSON Data Interface
├── Core Components
│   ├── Main Layout
│   ├── Navigation
│   └── Tab System
└── Feature Modules
    ├── Events Manager
    ├── Tasks Manager
    ├── Notes Board
    ├── Budget Tracker
    └── Setlist Manager
```

**Benefits of the Single-File Approach:**
- Zero navigation complexity (everything is tab-based)
- No need for routing libraries
- Simplified state management (each module handles its own state)
- Entire application can be grasped in one view
- Deployment requires a single file

### JSON Data Layer

Instead of a traditional backend, BandBrain uses a simple JSON-based approach:

1. **Type Definitions**: Define TypeScript interfaces for all data models
2. **Local Storage**: Use localStorage for initial MVP to store data between sessions
3. **API Simulation**: Create functions that read/write JSON data with artificial delay
4. **Optimistic Updates**: Update UI immediately, then persist changes asynchronously

This approach eliminates the need for backend infrastructure while maintaining a clean separation between data and UI layers.

## Core Functionality

### 1. Events Management

![Events Module](https://i.imgur.com/9XdXDJP.png)

**Key Features:**
- Card-based events display with type indicators (gig, rehearsal, other)
- Add new events via an expandable card that transforms into a form
- Edit existing events with inline form fields
- Delete events with confirmation dialog
- Mobile-optimized viewing for quick reference at venues

**Data Structure:**
```
Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: 'gig' | 'rehearsal' | 'other'
}
```

### 2. Task Management

![Tasks Module](https://i.imgur.com/MjYPB2Q.png)

**Key Features:**
- Single-input task creation (just type and hit enter)
- One-click completion toggling
- Click-to-edit task titles
- Automatic grouping of completed vs. in-progress tasks
- Assignment to band members with visual indicators

**Data Structure:**
```
Task {
  id: string
  title: string
  completed: boolean
  assignee?: string
}
```

### 3. Notes Board

![Notes Module](https://i.imgur.com/uHXQrkL.png)

**Key Features:**
- Expandable/collapsible note cards
- Support for multiline text with formatting
- Author attribution and timestamps
- Inline editing of title and content
- Grid layout for easy browsing

**Data Structure:**
```
Note {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
}
```

### 4. Budget Tracker

**Key Features:**
- Income and expense tracking
- Categorization of transactions
- Running balance calculation
- Date-based filtering
- Card-based transaction display

**Data Structure:**
```
Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  date: string
}
```

### 5. Setlist Manager

**Key Features:**
- Multiple setlists with songs
- Drag-and-drop song reordering
- Duration calculation
- Song details (key, tempo, notes)
- Print-friendly view for gigs

**Data Structure:**
```
SetList {
  id: string
  name: string
  songs: Song[]
}

Song {
  id: string
  title: string
  duration: string
  key?: string
}
```

## User Experience Design

### Inline Editing Philosophy

The core UX principle is "edit in place" - users never leave their current context to perform CRUD operations:

1. **Add New Items**: 
   - Empty cards transform into input forms
   - Single-input fields for simple items like tasks
   - No modal dialogs or separate forms

2. **Edit Existing Items**:
   - Click directly on content to transform it into editable fields
   - Save automatically on blur or explicit save button
   - Cancel edits with escape key or cancel button

3. **Delete Items**:
   - Confirmation happens within the card itself
   - No separate dialogs or pop-ups
   - Undo capability for accidental deletions

### Mobile-First Design

The UI is optimized for the primary use cases:
- Checking setlists during a gig
- Adding notes during rehearsal
- Tracking expenses while on tour
- Managing events from any device

Key mobile-specific patterns:
- Bottom tab navigation
- Full-width cards
- Touch-friendly hit areas
- Pull-to-refresh

## Implementation Strategy

### Phase 1: Core Structure
4. Set up TypeScript interfaces for all data types
5. Create the main layout with tabs
6. Implement the JSON data interface with localStorage

### Phase 2: Feature Implementation
7. Start with Events (the most visual module)
8. Add Tasks (the simplest module)
9. Implement Notes (showcases rich inline editing)
10. Add Budget tracking
11. Finish with Setlist management

### Phase 3: Polish & Launch
12. Add offline support via localStorage
13. Implement dark theme
14. Add basic animations for better feedback
15. Deploy as static site to Vercel/Netlify

## Data Persistence Strategy

### LocalStorage Implementation

The core data layer uses browser localStorage with a simple interface:

16. **Initialization**:
   - Load default data on first visit
   - Parse stored data on subsequent visits

17. **CRUD Operations**:
   - Read: Parse from localStorage with fallback to defaults
   - Create: Add to in-memory array and persist to localStorage
   - Update: Modify in-memory array and persist entire collection
   - Delete: Filter from in-memory array and persist updated collection

18. **Multiple Device Support**:
   - Simple file export/import mechanism
   - JSON file generation for backup

## Development Workflow

19. **Start with a scaffold of the single file**:
   - Define all TypeScript interfaces
   - Create stub components for all modules
   - Implement the tab navigation system

20. **Focus on one module at a time**:
   - Implement the data layer for that module
   - Create the UI components
   - Add inline editing functionality
   - Test thoroughly before moving to next module

21. **Use React Developer Tools to debug state**:
   - Monitor component re-renders
   - Inspect state changes
   - Verify data flow

## Launch Strategy

22. **Initial Release**:
   - Single band support via localStorage
   - All core modules functional
   - Basic sharing via JSON export/import

23. **User Feedback Collection**:
   - Simple form for feature requests
   - Usage analytics to see which modules get most use
   - Direct feedback from initial band users

24. **Iteration Based on Usage**:
   - Enhance most-used features first
   - Fix critical bugs
   - Add small improvements based on feedback

## Success Metrics

The MVP will be considered successful when:
25. A band can manage their entire workflow within the app
26. Users can add, edit and delete content without friction
27. The app works offline and syncs data reliably
28. Core features work equally well on mobile and desktop

---

This blueprint provides a comprehensive guide to building BandBrain as a single-file React application with a JSON-based data layer. By focusing on inline editing and a mobile-first design, the application delivers maximum value with minimal complexity.