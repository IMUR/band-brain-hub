# Process Loop Automation

This directory contains tools for automated testing, diagnostics, and fixing of the Band Brain Hub application.

## Overview

The process loop follows this workflow:

1. Set up Puppeteer with Chrome extension
2. Check browser logs, errors, network traffic
3. Attempt to fix issues based on diagnostics
4. Update memory with diagnostics and fix attempts
5. Rebuild the application
6. Test with Puppeteer
7. Re-check browser diagnostics
8. Undo ineffective fixes
9. Clear logs and rebuild
10. Repeat until issues are resolved or max iterations reached

## Usage

```bash
# Run the automated process loop
bun run process-loop

# Alternative command
bun run debug-autofix
```

## Configuration

Edit `config.js` to customize the process loop behavior:
- Puppeteer settings
- Preview server configuration
- Output paths for logs, screenshots, etc.
- Timeouts and thresholds
- Files to back up and monitor
- Elements to interact with during testing

## Requirements

- Bun runtime
- Chrome browser
- Chrome extension in `/e:/Band_Page/chrome-extension`
- ModelContextProtocol SDK
- Puppeteer

## Directory Structure

- `process-loop.js` - Main implementation
- `config.js` - Configuration options
- `../test-results/` - Outputs (created automatically)
  - `/screenshots/` - Screenshots from each iteration
  - `/logs/` - Console, network, and diagnostic logs
  - `/memory/` - Memory state from MCP
  - `/backups/` - File backups for recovery

## How It Works

1. **Setup**: Launches Puppeteer browser with Chrome extension and preview server
2. **Diagnostics**: Collects logs, errors, screenshots using MCP browser tools
3. **Analysis**: Identifies patterns in errors and generates fix suggestions
4. **Memory**: Updates knowledge graph with information about issues and fixes
5. **Execution**: Applies fixes, rebuilds and tests the application
6. **Verification**: Checks if fixes were effective by comparing before/after diagnostics
7. **Recovery**: Restores files from backup if fixes were ineffective

## Extending

To add custom fix strategies:
1. Update the `analyzeAndGenerateFix()` function
2. Add patterns for common error types
3. Implement specific fix logic in `applyFix()` 