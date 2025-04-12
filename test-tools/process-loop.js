// Process Loop Implementation
// Automated testing, debugging, and fixing process

import { launch } from 'puppeteer';
import { preview } from 'vite';
import { promisify } from 'util';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import config from './config.js';

// For MCP interaction
const MCPClient = require('@modelcontextprotocol/sdk');

const execAsync = promisify(exec);

// Create necessary directories
async function createDirectories() {
  for (const dir of Object.values(config.paths)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Save logs to file
async function saveLogs(logs, filename) {
  await fs.writeFile(
    path.join(config.paths.logs, filename),
    JSON.stringify(logs, null, 2)
  );
}

// Main process loop
async function runProcessLoop() {
  console.log("🚀 Starting automated process loop");
  
  await createDirectories();
  
  // Setup environment
  console.log("🔧 Setting up environment...");
  const previewServer = await preview({
    preview: config.preview
  });
  
  const browser = await launch(config.puppeteer);
  const page = await browser.newPage();
  
  // Navigate to the preview URL
  await page.goto(`http://localhost:${config.preview.port}`, {
    waitUntil: 'networkidle0',
    timeout: config.timeouts.pageLoad
  });
  
  // Initialize MCP client
  const mcpClient = new MCPClient.MCPClient();
  await mcpClient.initialize(page);
  
  // Initialize memory MCP client
  const memoryMCP = {
    async read_graph() {
      try {
        return await mcpClient.mcp_memory_read_graph({ random_string: "dummy" });
      } catch (error) {
        console.error("Error reading memory graph:", error);
        return null;
      }
    },
    async search_nodes(query) {
      try {
        return await mcpClient.mcp_memory_search_nodes({ query });
      } catch (error) {
        console.error("Error searching nodes:", error);
        return [];
      }
    },
    async open_nodes(names) {
      try {
        return await mcpClient.mcp_memory_open_nodes({ names });
      } catch (error) {
        console.error("Error opening nodes:", error);
        return [];
      }
    },
    async create_entities(entities) {
      try {
        return await mcpClient.mcp_memory_create_entities({ entities });
      } catch (error) {
        console.error("Error creating entities:", error);
        return null;
      }
    },
    async create_relations(relations) {
      try {
        return await mcpClient.mcp_memory_create_relations({ relations });
      } catch (error) {
        console.error("Error creating relations:", error);
        return null;
      }
    },
    async add_observations(observations) {
      try {
        return await mcpClient.mcp_memory_add_observations({ observations });
      } catch (error) {
        console.error("Error adding observations:", error);
        return null;
      }
    },
    async delete_entities(entityNames) {
      try {
        return await mcpClient.mcp_memory_delete_entities({ entityNames });
      } catch (error) {
        console.error("Error deleting entities:", error);
        return null;
      }
    },
    async delete_observations(deletions) {
      try {
        return await mcpClient.mcp_memory_delete_observations({ deletions });
      } catch (error) {
        console.error("Error deleting observations:", error);
        return null;
      }
    },
    async delete_relations(relations) {
      try {
        return await mcpClient.mcp_memory_delete_relations({ relations });
      } catch (error) {
        console.error("Error deleting relations:", error);
        return null;
      }
    }
  };
  
  // Helper functions for browser tools
  const browserTools = {
    async getConsoleLogs() {
      return await mcpClient.mcp_browser_tools_getConsoleLogs({ random_string: "dummy" });
    },
    async getConsoleErrors() {
      return await mcpClient.mcp_browser_tools_getConsoleErrors({ random_string: "dummy" });
    },
    async getNetworkLogs() {
      return await mcpClient.mcp_browser_tools_getNetworkLogs({ random_string: "dummy" });
    },
    async getNetworkErrors() {
      return await mcpClient.mcp_browser_tools_getNetworkErrors({ random_string: "dummy" });
    },
    async takeScreenshot() {
      return await mcpClient.mcp_browser_tools_takeScreenshot({ random_string: "dummy" });
    },
    async runPerformanceAudit() {
      return await mcpClient.mcp_browser_tools_runPerformanceAudit({ random_string: "dummy" });
    },
    async runAccessibilityAudit() {
      return await mcpClient.mcp_browser_tools_runAccessibilityAudit({ random_string: "dummy" });
    },
    async wipeLogs() {
      return await mcpClient.mcp_browser_tools_wipeLogs({ random_string: "dummy" });
    }
  };
  
  // Helper functions for puppeteer MCP
  const puppeteerMCP = {
    async navigate(url) {
      return await mcpClient.mcp_puppeteer_puppeteer_navigate({ url });
    },
    async screenshot(options) {
      return await mcpClient.mcp_puppeteer_puppeteer_screenshot(options);
    },
    async click(selector) {
      return await mcpClient.mcp_puppeteer_puppeteer_click({ selector });
    },
    async fill(selector, value) {
      return await mcpClient.mcp_puppeteer_puppeteer_fill({ selector, value });
    },
    async select(selector, value) {
      return await mcpClient.mcp_puppeteer_puppeteer_select({ selector, value });
    },
    async hover(selector) {
      return await mcpClient.mcp_puppeteer_puppeteer_hover({ selector });
    },
    async evaluate(script) {
      return await mcpClient.mcp_puppeteer_puppeteer_evaluate({ script });
    }
  };
  
  // Track fix attempts
  const fixAttempts = [];
  let iteration = 0;
  
  // Backup original state for possible restoration
  await backupCriticalFiles();
  
  try {
    while (iteration < config.maxIterations) {
      iteration++;
      console.log(`\n🔄 Starting iteration ${iteration}/${config.maxIterations}`);
      
      // Step 1: check browser-tools MCP
      console.log("📊 Collecting browser diagnostics...");
      const diagnostics = await collectBrowserDiagnostics(browserTools, iteration, 'before');
      
      // Step 2: attempt fix based on diagnostic information
      console.log("🔍 Analyzing issues and attempting fix...");
      const fixAttempt = await analyzeAndGenerateFix(diagnostics);
      
      if (!fixAttempt) {
        console.log("✅ No issues detected that require fixing. Ending process loop.");
        break;
      }
      
      console.log(`🔧 Attempting fix: ${fixAttempt.description}`);
      
      // Backup before applying fix
      await backupBeforeFix(iteration);
      
      // Apply the fix
      await applyFix(fixAttempt);
      fixAttempts.push({ ...fixAttempt, effective: false, iteration });
      
      // Step 3: update memory MCP
      console.log("🧠 Updating memory with diagnostic information and fix attempt...");
      await updateMemory(memoryMCP, diagnostics, fixAttempt, iteration);
      
      // Step 4: run build
      console.log("🔨 Running build...");
      try {
        await execAsync(config.commands.build);
      } catch (error) {
        console.error("❌ Build failed after fix attempt:", error);
        await undoLastFix(iteration);
        continue;
      }
      
      // Step 5: use puppeteer MCP tools to interact with the application
      console.log("🖱️ Testing application with Puppeteer...");
      await puppeteerMCP.navigate(`http://localhost:${config.preview.port}`);
      await testApplicationWithPuppeteer(puppeteerMCP, iteration);
      
      // Step 6: check browser-tools MCP again
      console.log("📊 Collecting post-fix diagnostics...");
      const postFixDiagnostics = await collectBrowserDiagnostics(browserTools, iteration, 'after');
      
      // Compare before and after diagnostics
      const fixWasEffective = evaluateFixEffectiveness(diagnostics, postFixDiagnostics);
      
      // Update fix attempt record
      fixAttempts[fixAttempts.length - 1].effective = fixWasEffective;
      
      // Step 7: undo ineffective fixes
      if (!fixWasEffective) {
        console.log("⚠️ Fix was ineffective, undoing changes...");
        await undoLastFix(iteration);
        // Update memory to record the ineffective fix
        await updateMemoryWithFailedFix(memoryMCP, fixAttempt, iteration);
      } else {
        console.log("✅ Fix was effective!");
      }
      
      // Step 8: wipe logs
      console.log("🧹 Wiping browser logs...");
      await browserTools.wipeLogs();
      
      // Step 9: rebuild
      console.log("🔨 Running final build for this iteration...");
      await execAsync(config.commands.build);
      
      // Refresh the page to load the new build
      await puppeteerMCP.navigate(`http://localhost:${config.preview.port}`);
      
      // Check if we should continue or if all issues are resolved
      if (postFixDiagnostics.errors.length === 0 && fixWasEffective) {
        console.log("🎉 All issues resolved! Process loop completed successfully.");
        break;
      }
    }
    
    // Print summary of fix attempts
    console.log("\n📝 Fix Attempt Summary:");
    fixAttempts.forEach((attempt, i) => {
      console.log(`${i+1}. [${attempt.effective ? '✅' : '❌'}] ${attempt.description}`);
    });
    
  } catch (error) {
    console.error("❌ Error in process loop:", error);
  } finally {
    // Clean up
    if (browser) await browser.close();
    if (previewServer) await previewServer.close();
  }
}

// Helper function to collect browser diagnostics
async function collectBrowserDiagnostics(browserTools, iteration, stage) {
  const timestamp = new Date().toISOString();
  
  try {
    // Collect all diagnostics
    const [logs, errors, networkLogs, networkErrors, performanceData] = await Promise.all([
      browserTools.getConsoleLogs(),
      browserTools.getConsoleErrors(),
      browserTools.getNetworkLogs(),
      browserTools.getNetworkErrors(),
      browserTools.runPerformanceAudit()
    ]);
    
    // Take a screenshot
    const screenshot = await browserTools.takeScreenshot();
    
    // If this is the 'after' stage, also run accessibility audit
    let accessibilityData = null;
    if (stage === 'after') {
      accessibilityData = await browserTools.runAccessibilityAudit();
    }
    
    // Save all diagnostics to files
    await saveLogs(logs, `console-logs-${iteration}-${stage}.json`);
    await saveLogs(errors, `console-errors-${iteration}-${stage}.json`);
    await saveLogs(networkLogs, `network-logs-${iteration}-${stage}.json`);
    await saveLogs(networkErrors, `network-errors-${iteration}-${stage}.json`);
    await saveLogs(performanceData, `performance-${iteration}-${stage}.json`);
    
    if (accessibilityData) {
      await saveLogs(accessibilityData, `accessibility-${iteration}-${stage}.json`);
    }
    
    // Save screenshot
    if (screenshot && screenshot.data) {
      await fs.writeFile(
        path.join(config.paths.screenshots, `screenshot-${iteration}-${stage}.png`),
        Buffer.from(screenshot.data, 'base64')
      );
    }
    
    return {
      logs,
      errors,
      networkLogs,
      networkErrors,
      performanceData,
      accessibilityData,
      timestamp
    };
  } catch (error) {
    console.error(`Error collecting diagnostics (${stage}):`, error);
    return {
      logs: [],
      errors: [],
      networkLogs: [],
      networkErrors: [],
      performanceData: null,
      accessibilityData: null,
      error: error.toString(),
      timestamp
    };
  }
}

// Function to test the application using Puppeteer
async function testApplicationWithPuppeteer(puppeteerMCP, iteration) {
  // This would contain application-specific test scenarios
  // For now, we'll just do some basic interactions
  try {
    // Take a screenshot at the start
    await puppeteerMCP.screenshot({ name: `test-start-${iteration}` });
    
    // Click on key navigation elements if they exist
    const selectors = config.testSelectors || [
      '#app', // Main container
      'nav button', // Navigation buttons
      '.main-content button', // Buttons in main content
      'form input', // Form inputs
      'a[href]' // Links
    ];
    
    for (const selector of selectors) {
      // Check if the selector exists before trying to interact
      const exists = await puppeteerMCP.evaluate(`!!document.querySelector('${selector}')`);
      if (exists) {
        console.log(`🖱️ Interacting with ${selector}`);
        
        // Different interactions based on element type
        if (selector.includes('input')) {
          await puppeteerMCP.fill(selector, 'Test input');
        } else if (selector.includes('button') || selector.includes('a[href]')) {
          await puppeteerMCP.click(selector);
          // Wait for any navigation or state changes
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          await puppeteerMCP.hover(selector);
        }
        
        // Take a screenshot after each interaction
        await puppeteerMCP.screenshot({ name: `test-after-${selector.replace(/[^a-zA-Z0-9]/g, '-')}-${iteration}` });
      }
    }
    
    // Evaluate page state
    const pageState = await puppeteerMCP.evaluate(`
      JSON.stringify({
        title: document.title,
        url: window.location.href,
        elements: {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          links: document.querySelectorAll('a').length
        }
      })
    `);
    
    console.log(`📝 Page state: ${pageState}`);
    
  } catch (error) {
    console.error("❌ Error testing application with Puppeteer:", error);
  }
}

// Placeholder for fix analysis - this would need to be customized for your application
async function analyzeAndGenerateFix(diagnostics) {
  // Simple analysis looking for common patterns
  // In a real implementation, this would be much more sophisticated
  
  if (diagnostics.errors.length === 0 && diagnostics.networkErrors.length === 0) {
    return null; // No errors to fix
  }
  
  // Check for common errors
  for (const error of diagnostics.errors) {
    const errorText = error.message || '';
    
    // Check for undefined variable errors
    if (errorText.includes('is not defined') || errorText.includes('Cannot read property')) {
      const match = errorText.match(/(['"])(.+?)\1/) || errorText.match(/property '(.+?)' of/);
      if (match) {
        const variableName = match[2] || match[1];
        return {
          type: 'undefined-variable',
          description: `Fix undefined variable: ${variableName}`,
          file: error.source || 'src/App.svelte',
          solution: `Declare ${variableName} before use or check its scope`
        };
      }
    }
    
    // Check for syntax errors
    if (errorText.includes('Syntax error') || errorText.includes('Unexpected token')) {
      return {
        type: 'syntax-error',
        description: `Fix syntax error: ${errorText}`,
        file: error.source || 'src/App.svelte',
        solution: 'Correct syntax error in the specified file'
      };
    }
    
    // Check for type errors
    if (errorText.includes('TypeScript') || errorText.includes('type') || errorText.includes('Type')) {
      return {
        type: 'type-error',
        description: `Fix type error: ${errorText}`,
        file: error.source || 'src/App.svelte',
        solution: 'Correct the type definition or add proper type casting'
      };
    }
  }
  
  // Check for network errors
  if (diagnostics.networkErrors.length > 0) {
    const networkError = diagnostics.networkErrors[0];
    return {
      type: 'network-error',
      description: `Fix network error: ${networkError.url} (${networkError.status})`,
      file: 'src/App.svelte',
      solution: 'Check network request handling and error states'
    };
  }
  
  // Generic fallback
  return {
    type: 'general-error',
    description: 'Fix general application error',
    file: 'src/App.svelte',
    solution: 'Review error logs and identify root cause'
  };
}

// Placeholder for fix application
async function applyFix(fixAttempt) {
  console.log(`Applying fix: ${fixAttempt.description}`);
  console.log(`Suggested solution: ${fixAttempt.solution}`);
  
  // In a real implementation, this would actually modify the code
  // For now, just log what we would do
  
  // Here you would add actual code modification logic based on the fixAttempt
  // For example, you might read the file, make changes, and write it back
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fix time
}

// Backup critical files
async function backupCriticalFiles() {
  const timestamp = Date.now();
  const backupDir = path.join(config.paths.backups, 'initial');
  
  await fs.mkdir(backupDir, { recursive: true });
  
  // List of critical files to backup
  const criticalFiles = config.criticalFiles || [
    'src/App.svelte',
    'src/main.ts',
    'vite.config.ts',
    'package.json'
  ];
  
  for (const file of criticalFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      await fs.writeFile(
        path.join(backupDir, path.basename(file)),
        content
      );
    } catch (error) {
      console.error(`Error backing up ${file}:`, error);
    }
  }
}

// Backup before applying a fix
async function backupBeforeFix(iteration) {
  const backupDir = path.join(config.paths.backups, `iteration-${iteration}`);
  
  await fs.mkdir(backupDir, { recursive: true });
  
  // List of files that might be modified
  const filesToBackup = config.criticalFiles || [
    'src/App.svelte',
    'src/main.ts',
    'vite.config.ts'
  ];
  
  for (const file of filesToBackup) {
    try {
      const content = await fs.readFile(file, 'utf8');
      await fs.writeFile(
        path.join(backupDir, path.basename(file)),
        content
      );
    } catch (error) {
      console.error(`Error backing up ${file}:`, error);
    }
  }
}

// Undo last fix by restoring from backup
async function undoLastFix(iteration) {
  const backupDir = path.join(config.paths.backups, `iteration-${iteration}`);
  
  // Check if backup exists
  try {
    await fs.access(backupDir);
  } catch (error) {
    console.error(`No backup found for iteration ${iteration}`);
    return;
  }
  
  // Restore from backup
  const backupFiles = await fs.readdir(backupDir);
  
  for (const file of backupFiles) {
    try {
      const content = await fs.readFile(path.join(backupDir, file), 'utf8');
      
      // Determine the original file path
      let originalPath;
      if (file === 'App.svelte' || file === 'main.ts') {
        originalPath = path.join('src', file);
      } else {
        originalPath = file;
      }
      
      await fs.writeFile(originalPath, content);
      console.log(`Restored ${originalPath} from backup`);
    } catch (error) {
      console.error(`Error restoring ${file}:`, error);
    }
  }
}

// Update memory with diagnostic information and fix attempt
async function updateMemory(memoryMCP, diagnostics, fixAttempt, iteration) {
  try {
    // Create an entity for this iteration
    const iterationEntity = {
      name: `Iteration-${iteration}`,
      entityType: 'ProcessIteration',
      observations: [
        `Iteration ${iteration} of process loop`,
        `Timestamp: ${new Date().toISOString()}`,
        `Found ${diagnostics.errors.length} console errors and ${diagnostics.networkErrors.length} network errors`
      ]
    };
    
    await memoryMCP.create_entities({ entities: [iterationEntity] });
    
    // Create an entity for the fix attempt
    const fixEntity = {
      name: `Fix-${iteration}-${fixAttempt.type}`,
      entityType: 'FixAttempt',
      observations: [
        `Type: ${fixAttempt.type}`,
        `Description: ${fixAttempt.description}`,
        `Solution: ${fixAttempt.solution}`,
        `Target file: ${fixAttempt.file}`
      ]
    };
    
    await memoryMCP.create_entities({ entities: [fixEntity] });
    
    // Create relation between iteration and fix
    await memoryMCP.create_relations({
      relations: [
        {
          from: iterationEntity.name,
          relationType: 'attempted',
          to: fixEntity.name
        }
      ]
    });
    
    // Create entities for each error and relate them to the iteration
    const errorEntities = [];
    
    diagnostics.errors.forEach((error, index) => {
      const errorEntity = {
        name: `Error-${iteration}-${index}`,
        entityType: 'ConsoleError',
        observations: [
          error.message || 'Unknown error',
          `Source: ${error.source || 'Unknown'}`,
          `Stack: ${error.stack || 'None'}`
        ]
      };
      
      errorEntities.push(errorEntity);
    });
    
    if (errorEntities.length > 0) {
      await memoryMCP.create_entities({ entities: errorEntities });
      
      // Create relations between iteration and errors
      const errorRelations = errorEntities.map(errorEntity => ({
        from: iterationEntity.name,
        relationType: 'contained',
        to: errorEntity.name
      }));
      
      await memoryMCP.create_relations({ relations: errorRelations });
    }
    
    console.log(`Updated memory with iteration ${iteration} data`);
  } catch (error) {
    console.error("Error updating memory:", error);
  }
}

// Update memory with information about a failed fix
async function updateMemoryWithFailedFix(memoryMCP, fixAttempt, iteration) {
  try {
    // Add observation to the fix entity about it being ineffective
    await memoryMCP.add_observations({
      observations: [
        {
          entityName: `Fix-${iteration}-${fixAttempt.type}`,
          contents: [
            'Fix was ineffective and was reverted',
            `Timestamp: ${new Date().toISOString()}`
          ]
        }
      ]
    });
    
    console.log(`Updated memory with failed fix information for iteration ${iteration}`);
  } catch (error) {
    console.error("Error updating memory with failed fix:", error);
  }
}

// Evaluate if a fix was effective
function evaluateFixEffectiveness(before, after) {
  // Simple heuristic: check if there are fewer errors after the fix
  const beforeErrorCount = before.errors.length;
  const afterErrorCount = after.errors.length;
  
  const beforeNetworkErrorCount = before.networkErrors.length;
  const afterNetworkErrorCount = after.networkErrors.length;
  
  // Calculate total error reduction
  const totalBefore = beforeErrorCount + beforeNetworkErrorCount;
  const totalAfter = afterErrorCount + afterNetworkErrorCount;
  
  // Fix is effective if total errors decreased
  const isEffective = totalAfter < totalBefore;
  
  console.log(`Error count: Before=${totalBefore}, After=${totalAfter}, Effective=${isEffective}`);
  
  return isEffective;
}

// Run the process loop
runProcessLoop().catch(console.error);

export default runProcessLoop; 