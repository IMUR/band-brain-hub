#!/usr/bin/env bun
// CLI for running the process loop

import { promises as fs } from 'fs';
import path from 'path';
import runProcessLoop from './process-loop.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--max-iterations' || arg === '-m') {
    options.maxIterations = parseInt(args[++i], 10);
  } else if (arg === '--headless' || arg === '-h') {
    options.headless = true;
  } else if (arg === '--extension-path' || arg === '-e') {
    options.extensionPath = args[++i];
  } else if (arg === '--config' || arg === '-c') {
    options.configPath = args[++i];
  } else if (arg === '--help') {
    printHelp();
    process.exit(0);
  }
}

async function main() {
  try {
    // Load custom config if specified
    if (options.configPath) {
      const configPath = path.resolve(options.configPath);
      try {
        await fs.access(configPath);
        console.log(`Loading custom config from ${configPath}`);
        // In a real implementation, we would load the config here
      } catch (error) {
        console.error(`Error: Config file not found at ${configPath}`);
        process.exit(1);
      }
    }
    
    // Override config with command line options
    if (options.maxIterations) {
      console.log(`Setting max iterations to ${options.maxIterations}`);
      // In a real implementation, we would update the config here
    }
    
    if (options.headless) {
      console.log('Running in headless mode');
      // In a real implementation, we would update the config here
    }
    
    if (options.extensionPath) {
      console.log(`Using extension from ${options.extensionPath}`);
      // In a real implementation, we would update the config here
    }
    
    // Run the process loop
    await runProcessLoop();
  } catch (error) {
    console.error('Error running process loop:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Process Loop CLI

Usage:
  bun test-tools/cli.js [options]

Options:
  --max-iterations, -m <n>   Set maximum number of iterations
  --headless, -h             Run in headless mode
  --extension-path, -e <path> Set path to Chrome extension
  --config, -c <path>        Specify custom config file
  --help                     Show this help message
  
Examples:
  bun test-tools/cli.js --max-iterations 5
  bun test-tools/cli.js --headless
  bun test-tools/cli.js --extension-path "/path/to/extension"
  `);
}

main().catch(console.error); 