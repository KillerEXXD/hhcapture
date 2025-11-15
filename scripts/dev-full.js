#!/usr/bin/env node
// dev-full.js - Starts dev servers with proper Ctrl+C handling

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Track child processes
const processes = [];

// Cleanup function
async function cleanup() {
  console.log('\n\n[DEBUG] cleanup() called');
  console.log('[DEBUG] Number of processes to stop:', processes.length);

  // Kill all child processes
  for (const proc of processes) {
    try {
      if (!proc.killed) {
        console.log(`[DEBUG] Stopping PID ${proc.pid}...`);

        // Try to kill the process gracefully first
        try {
          proc.kill('SIGTERM');
          console.log(`[DEBUG] Sent SIGTERM to PID ${proc.pid}`);
        } catch (killErr) {
          // If that fails, try with system kill
          console.log(`[DEBUG] SIGTERM failed, trying process.kill...`);
          process.kill(proc.pid, 'SIGTERM');
          console.log(`[DEBUG] Sent system SIGTERM to PID ${proc.pid}`);
        }
      } else {
        console.log(`[DEBUG] PID ${proc.pid} already killed`);
      }
    } catch (err) {
      console.log(`[DEBUG] Error killing PID ${proc.pid}:`, err.message);
    }
  }

  // Wait a moment for graceful shutdown
  console.log('[DEBUG] Waiting 1000ms for graceful shutdown...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('[DEBUG] Running kill-ports for cleanup...');
  try {
    const result = await execAsync('npm run kill-ports', { cwd: projectRoot });
    console.log('[DEBUG] kill-ports completed');
  } catch (err) {
    console.log('[DEBUG] kill-ports error:', err.message);
  }

  console.log('[DEBUG] All services stopped.\n');
}

// Register cleanup handlers
console.log('[DEBUG] Registering signal handlers...');

process.on('SIGINT', async () => {
  console.log('\n[DEBUG] ========== SIGINT (Ctrl+C) detected! ==========');
  try {
    await cleanup();
    console.log('[DEBUG] Cleanup completed, exiting with code 0');
    process.exit(0);
  } catch (err) {
    console.log('[DEBUG] Error during cleanup:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n[DEBUG] ========== SIGTERM detected! ==========');
  try {
    await cleanup();
    console.log('[DEBUG] Cleanup completed, exiting with code 0');
    process.exit(0);
  } catch (err) {
    console.log('[DEBUG] Error during cleanup:', err);
    process.exit(1);
  }
});

process.on('beforeExit', (code) => {
  console.log('[DEBUG] beforeExit event, code:', code);
});

process.on('exit', (code) => {
  console.log('[DEBUG] exit event, code:', code);
});

// Main function
async function main() {
  console.log('[DEBUG] main() started');
  console.log('[DEBUG] Project root:', projectRoot);

  console.log('Cleaning up ports...');
  try {
    const result = await execAsync('npm run kill-ports', { cwd: projectRoot });
    console.log('[DEBUG] Initial cleanup done');
  } catch (err) {
    console.error('[DEBUG] Error cleaning ports:', err.message);
  }

  console.log('\nStarting all development services...');
  console.log('Press Ctrl+C to stop all services\n');

  // Start Vite dev server
  console.log('[APP] Starting Vite dev server...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  processes.push(viteProcess);
  console.log(`[APP] Started (PID: ${viteProcess.pid})`);
  console.log('[DEBUG] Vite process added to tracking');

  // Start log server
  console.log('[LOGS] Starting log server...');
  const logProcess = spawn('npm', ['run', 'log-server'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  processes.push(logProcess);
  console.log(`[LOGS] Started (PID: ${logProcess.pid})`);
  console.log('[DEBUG] Log server process added to tracking');
  console.log('[DEBUG] Total processes tracked:', processes.length);

  console.log('\nAll services are running!');
  console.log('Waiting for dev server to be ready...');

  // Wait for Vite to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Launch Chrome
  console.log('Opening Chrome browser...');
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];

  let chromeFound = false;
  for (const chromePath of chromePaths) {
    try {
      spawn(chromePath, ['http://127.0.0.1:3001'], { detached: true, stdio: 'ignore' });
      console.log('Chrome launched!');
      chromeFound = true;
      break;
    } catch (err) {
      // Try next path
    }
  }

  if (!chromeFound) {
    console.log('Chrome not found. Please open http://127.0.0.1:3001 manually.');
  }

  console.log('\nServices running. Press Ctrl+C to stop...\n');
  console.log('[DEBUG] Entering wait loop...');

  // Wait for processes to exit
  viteProcess.on('exit', (code, signal) => {
    console.log(`[DEBUG] Vite process exited with code ${code}, signal ${signal}`);
  });

  logProcess.on('exit', (code, signal) => {
    console.log(`[DEBUG] Log server process exited with code ${code}, signal ${signal}`);
  });

  await Promise.race([
    new Promise(resolve => viteProcess.on('exit', resolve)),
    new Promise(resolve => logProcess.on('exit', resolve))
  ]);

  console.log('[DEBUG] A service exited unexpectedly, running cleanup...');
  await cleanup();
  console.log('[DEBUG] Exiting with code 1');
  process.exit(1);
}

// Run main
console.log('[DEBUG] Starting application...');
main().catch(async (err) => {
  console.error('[DEBUG] Unhandled error in main():', err);
  await cleanup();
  process.exit(1);
});
