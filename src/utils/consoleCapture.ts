/**
 * Console Capture Utility
 *
 * Captures all console.log, console.warn, console.error calls
 * and sends them to the log server for debugging with Claude Code
 */

const LOG_SERVER_URL = 'http://localhost:3002/api/logs';
const BATCH_INTERVAL = 2000; // Send logs every 2 seconds

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'debug';
  args: any[];
}

class ConsoleCapture {
  private logQueue: LogEntry[] = [];
  private batchTimer: number | null = null;
  private originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

  /**
   * Start capturing console logs
   */
  start() {
    // Override console methods
    console.log = (...args: any[]) => {
      this.capture('log', args);
      this.originalConsole.log.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.capture('warn', args);
      this.originalConsole.warn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.capture('error', args);
      this.originalConsole.error.apply(console, args);
    };

    console.debug = (...args: any[]) => {
      this.capture('debug', args);
      this.originalConsole.debug.apply(console, args);
    };

    // Start batch timer
    this.startBatchTimer();

    console.log('✅ Console capture started - sending logs to', LOG_SERVER_URL);
  }

  /**
   * Capture a console call
   */
  private capture(level: LogEntry['level'], args: any[]) {
    this.logQueue.push({
      timestamp: new Date().toISOString(),
      level,
      args
    });
  }

  /**
   * Start batch timer to send logs periodically
   */
  private startBatchTimer() {
    this.batchTimer = window.setInterval(() => {
      this.flush();
    }, BATCH_INTERVAL);
  }

  /**
   * Send queued logs to server
   */
  private async flush() {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch(LOG_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      // Silently fail - don't spam console with log server errors
      // (The original console.error would create an infinite loop)
    }
  }

  /**
   * Stop capturing and restore original console
   */
  stop() {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;

    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    this.originalConsole.log('✅ Console capture stopped');
  }
}

// Export singleton instance
export const consoleCapture = new ConsoleCapture();
