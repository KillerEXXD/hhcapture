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
  console.log('\nStopping all services...');

  // Kill all child processes
  for (const proc of processes) {
    try {
      if (!proc.killed) {
        // Try to kill the process gracefully first
        try {
          proc.kill('SIGTERM');
        } catch (killErr) {
          // If that fails, try with system kill
          process.kill(proc.pid, 'SIGTERM');
        }
      }
    } catch (err) {
      // Ignore errors during cleanup
    }
  }

  // Wait a moment for graceful shutdown
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clean up ports
  try {
    await execAsync('npm run kill-ports', { cwd: projectRoot });
  } catch (err) {
    // Ignore errors
  }

  console.log('All services stopped.\n');
}

// Register cleanup handlers
process.on('SIGINT', async () => {
  try {
    await cleanup();
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await cleanup();
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err.message);
    process.exit(1);
  }
});

// Main function
async function main() {
  console.log('Cleaning up ports...');
  try {
    await execAsync('npm run kill-ports', { cwd: projectRoot });
  } catch (err) {
    console.error('Error cleaning ports:', err.message);
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

  // Start log server
  console.log('[LOGS] Starting log server...');
  const logProcess = spawn('npm', ['run', 'log-server'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  processes.push(logProcess);
  console.log(`[LOGS] Started (PID: ${logProcess.pid})`);

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

  // Wait for processes to exit
  await Promise.race([
    new Promise(resolve => viteProcess.on('exit', resolve)),
    new Promise(resolve => logProcess.on('exit', resolve))
  ]);

  console.log('\nA service exited unexpectedly.');
  await cleanup();
  process.exit(1);
}

// Run main
main().catch(async (err) => {
  console.error('Error:', err.message);
  await cleanup();
  process.exit(1);
});
