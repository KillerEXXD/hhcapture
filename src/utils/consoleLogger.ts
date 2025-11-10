/**
 * Console Logger for Claude Code Integration
 *
 * Intercepts console methods and stores logs in memory for syncing to the log server.
 * This allows Claude Code to automatically see all console output for debugging.
 */

export interface LogEntry {
  timestamp: number;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  args: any[];
}

class ConsoleLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    this.interceptConsole();
    this.log('ConsoleLogger', 'Initialized - Logs will sync to Claude Code');
  }

  private interceptConsole() {
    // Intercept console.log
    console.log = (...args: any[]) => {
      this.captureLog('log', args);
      this.originalConsole.log(...args);
    };

    // Intercept console.info
    console.info = (...args: any[]) => {
      this.captureLog('info', args);
      this.originalConsole.info(...args);
    };

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.captureLog('warn', args);
      this.originalConsole.warn(...args);
    };

    // Intercept console.error
    console.error = (...args: any[]) => {
      this.captureLog('error', args);
      this.originalConsole.error(...args);
    };

    // Intercept console.debug
    console.debug = (...args: any[]) => {
      this.captureLog('debug', args);
      this.originalConsole.debug(...args);
    };
  }

  private captureLog(level: LogEntry['level'], args: any[]) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      args: this.serializeArgs(args),
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private serializeArgs(args: any[]): any[] {
    return args.map(arg => {
      // Handle errors specially
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        };
      }

      // Handle DOM elements
      if (typeof arg === 'object' && arg?.nodeType) {
        return `[${arg.nodeName}]`;
      }

      // Handle functions
      if (typeof arg === 'function') {
        return `[Function: ${arg.name || 'anonymous'}]`;
      }

      // Handle other objects (deep clone to avoid circular refs)
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch {
          return '[Object (circular reference)]';
        }
      }

      return arg;
    });
  }

  /**
   * Get all captured logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs since a specific timestamp
   */
  public getLogsSince(timestamp: number): LogEntry[] {
    return this.logs.filter(log => log.timestamp > timestamp);
  }

  /**
   * Clear all captured logs
   */
  public clearLogs() {
    this.logs = [];
    this.log('ConsoleLogger', 'Logs cleared');
  }

  /**
   * Internal log method (uses original console to avoid recursion)
   */
  private log(...args: any[]) {
    this.originalConsole.log('[ConsoleLogger]', ...args);
  }
}

// Create singleton instance
export const consoleLogger = new ConsoleLogger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__consoleLogger = consoleLogger;
}
