
# Final Process Loop

1. Set up Puppeteer with Chrome extension:
   - Launch browser with args: `--disable-extensions-except=/e:/Band_Page/chrome-extension`, `--load-extension=/e:/Band_Page/chrome-extension`
   - puppeteer_navigate to localhost preview URL

2. check browser-tools MCP: getConsoleLogs, getConsoleErrors, getNetworkLogs, getNetworkErrors, takeScreenshot, runPerformanceAudit

3. attempt fix based on diagnostic information:
   - Analyze errors and logs
   - Make targeted code changes

4. update memory MCP: read_graph, search_nodes, open_nodes, create_entities, create_relations, add_observations
   - Record issues found and fixes attempted

5. run: bun run build
   - Automatically triggers puppeteer_navigate to refresh browser

6. use puppeteer MCP: puppeteer_click, puppeteer_fill, puppeteer_select, puppeteer_hover, puppeteer_evaluate, puppeteer_screenshot
   - Test application functionality
   - Trigger potential error conditions
   - Exercise UI components

7. check browser-tools MCP: getConsoleLogs, getConsoleErrors, getNetworkLogs, getNetworkErrors, takeScreenshot, runAccessibilityAudit
   - Compare with pre-fix diagnostics

8. undo ineffective attempted fixes (if errors persist or new ones appear):
   - memory MCP: delete_entities, delete_relations, delete_observations
   - Revert code changes
   - Record failed fix attempt

9. use browser-tools MCP: wipeLogs
   - Clear console state for next iteration

10. run: bun run build
    - Automatically triggers puppeteer_navigate to refresh browser

Repeat
