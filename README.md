# Band Brain Hub

A collaborative web application for band members to manage events, tasks, notes, finances, and setlists.

## Features

- Event management
- Task tracking
- Note sharing
- Financial tracking
- Setlist management
- Offline support
- Real-time sync

## Tech Stack

- Svelte 5
- TypeScript
- Tailwind CSS
- IndexedDB (via idb)
- Vite
- Bun

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Automated Testing & Debugging

The project includes an automated process loop for testing, diagnosing, and fixing issues:

```bash
# Run the automated process loop
bun run process-loop
```

The process loop:
1. Checks browser logs, errors, network traffic
2. Attempts to fix issues based on diagnostics
3. Updates memory with diagnostics and fix attempts
4. Rebuilds the application
5. Tests with Puppeteer
6. Re-checks browser diagnostics
7. Undoes ineffective fixes
8. Repeats until issues are resolved

See `test-tools/README.md` for more details.

## Browser Extension

The application includes a Chrome extension for enhanced debugging and diagnostics. It's loaded automatically when running the process loop.

## Project Structure

- `src/` - Source code
  - `App.svelte` - Main application component
  - `main.ts` - Application entry point
  - `components/` - Reusable components
- `test-tools/` - Automated testing and debugging tools
- `chrome-extension/` - Browser extension for debugging
- `dist/` - Production build (generated)

## License

Private 