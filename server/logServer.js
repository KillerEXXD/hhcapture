/**
 * Console Log Server for Claude Code Integration
 *
 * This server receives console logs from the browser and writes them to a file
 * that Claude Code can read for debugging assistance.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;
const LOG_FILE = path.join(__dirname, '../logs/console-logs.txt');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize log file
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '=== Console Logs ===\n\n');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Log server is running' });
});

// Receive logs from browser
app.post('/api/logs', (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Invalid logs format' });
    }

    // Format logs for file
    const formattedLogs = logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const level = log.level.toUpperCase().padEnd(5);

      // Format arguments (handle objects, arrays, etc.)
      const args = log.args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');

      return `[${timestamp}] ${level} ${args}`;
    }).join('\n');

    // Append to log file
    fs.appendFileSync(LOG_FILE, formattedLogs + '\n');

    res.json({ success: true, count: logs.length });
  } catch (error) {
    console.error('Error writing logs:', error);
    res.status(500).json({ error: 'Failed to write logs' });
  }
});

// Clear logs endpoint
app.delete('/api/logs', (req, res) => {
  try {
    fs.writeFileSync(LOG_FILE, '=== Console Logs (Cleared) ===\n\n');
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✅ Log Server Running on port ${PORT}`);
  console.log(`📝 Logs will be written to: ${LOG_FILE}`);
  console.log(`🤖 Ready to receive browser logs for Claude Code\n`);
}).on('error', (err) => {
  console.error(`❌ Failed to start log server: ${err.message}`);
  process.exit(1);
});
