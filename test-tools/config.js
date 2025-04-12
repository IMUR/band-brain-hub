// Process Loop Configuration

export default {
  // Puppeteer configuration
  puppeteer: {
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--js-flags=--expose-gc',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      `--disable-extensions-except=/e:/Band_Page/chrome-extension`,
      `--load-extension=/e:/Band_Page/chrome-extension`
    ],
    ignoreHTTPSErrors: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: false
  },
  
  // Output paths
  paths: {
    screenshots: './test-results/screenshots',
    logs: './test-results/logs',
    memory: './test-results/memory',
    backups: './test-results/backups'
  },
  
  // Timeouts
  timeouts: {
    pageLoad: 30000,
    stabilization: 2000,
    networkIdle: 5000
  },
  
  // Process loop settings
  maxIterations: 10,
  
  // Commands to run
  commands: {
    build: 'bun run build'
  },
  
  // Thresholds for fix effectiveness evaluation
  effectivenessThresholds: {
    errorReduction: 0.5,      // 50% reduction in errors
    warningReduction: 0.3,    // 30% reduction in warnings 
    networkErrorReduction: 0.7 // 70% reduction in network errors
  },
  
  // File paths to backup and monitor
  criticalFiles: [
    'src/App.svelte',
    'src/main.ts',
    'vite.config.ts',
    'package.json',
    'tailwind.config.js',
    'svelte.config.js'
  ],
  
  // Elements to interact with during testing
  testSelectors: [
    '#app',
    'nav button',
    '.main-content button',
    'form input',
    'a[href]',
    '.btn',
    '.input',
    '[data-testid]'
  ],
  
  // For use in extension loading
  extensionPath: '/e:/Band_Page/chrome-extension'
}; 