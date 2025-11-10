// src/utils/consoleLogger.ts
// Console Logger - Automatically captures all console logs
// Usage: Press Ctrl+Shift+L to download logs, Ctrl+Shift+C to copy

interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: any[];
  stack?: string;
}

class ConsoleLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 200;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    
    this.interceptConsole();
    this.setupKeyboardShortcuts();
    this.loadSavedLogs();
    this.isInitialized = true;
    
    console.log('%c[ConsoleLogger] Initialized! Press Ctrl+Shift+L to download logs', 
      'color: green; font-weight: bold');
  }

  private interceptConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    console.log = (...args: any[]) => {
      this.addLog('log', args);
      originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const error = args.find(arg => arg instanceof Error);
      this.addLog('error', args, error?.stack);
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.addLog('warn', args);
      originalWarn.apply(console, args);
    };

    console.info = (...args: any[]) => {
      this.addLog('info', args);
      originalInfo.apply(console, args);
    };

    console.debug = (...args: any[]) => {
      this.addLog('debug', args);
      originalDebug.apply(console, args);
    };
  }

  private addLog(level: LogEntry['level'], message: any[], stack?: string) {
    const timestamp = new Date().toISOString();
    
    this.logs.push({
      timestamp,
      level,
      message,
      stack
    });

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Auto-save to localStorage
    this.saveLogs();
  }

  private saveLogs() {
    try {
      const serialized = JSON.stringify(this.logs);
      localStorage.setItem('poker_console_logs', serialized);
    } catch (e) {
      // Handle quota exceeded - clear old logs
      this.logs = this.logs.slice(-50);
      try {
        localStorage.setItem('poker_console_logs', JSON.stringify(this.logs));
      } catch {
        // Still failing, give up on persistence
      }
    }
  }

  private loadSavedLogs() {
    try {
      const saved = localStorage.getItem('poker_console_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved logs:', e);
    }
  }

  private setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Shift+L to download logs
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.downloadLogs();
      }

      // Ctrl+Shift+C to copy logs to clipboard
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.copyToClipboard();
      }

      // Ctrl+Shift+X to clear logs
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        this.clearLogs();
        console.log('%c[ConsoleLogger] Logs cleared!', 'color: orange; font-weight: bold');
      }
    });
  }

  public exportLogs(): string {
    if (this.logs.length === 0) {
      return 'No logs captured yet.';
    }

    const lines: string[] = [
      '='.repeat(80),
      'POKER HAND COLLECTOR - CONSOLE LOGS',
      `Captured: ${this.logs.length} entries`,
      `Time Range: ${this.logs[0].timestamp} to ${this.logs[this.logs.length - 1].timestamp}`,
      '='.repeat(80),
      ''
    ];

    for (const log of this.logs) {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const level = log.level.toUpperCase().padEnd(5);
      
      // Format message
      const message = log.message
        .map(m => {
          if (typeof m === 'object') {
            try {
              return JSON.stringify(m, null, 2);
            } catch {
              return String(m);
            }
          }
          return String(m);
        })
        .join(' ');

      lines.push(`[${time}] [${level}] ${message}`);
      
      // Add stack trace for errors
      if (log.stack) {
        lines.push(`    Stack: ${log.stack}`);
      }
      
      lines.push(''); // Empty line between entries
    }

    return lines.join('\n');
  }

  public downloadLogs() {
    const content = this.exportLogs();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `poker-console-logs-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('%c[ConsoleLogger] Logs downloaded! (' + this.logs.length + ' entries)', 
      'color: green; font-weight: bold');
  }

  public async copyToClipboard() {
    try {
      const content = this.exportLogs();
      await navigator.clipboard.writeText(content);
      console.log('%c[ConsoleLogger] Logs copied to clipboard! (' + this.logs.length + ' entries)', 
        'color: green; font-weight: bold');
      return true;
    } catch (err) {
      console.error('Failed to copy logs:', err);
      return false;
    }
  }

  public clearLogs() {
    this.logs = [];
    localStorage.removeItem('poker_console_logs');
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogCount(): number {
    return this.logs.length;
  }

  // Get only error logs
  public getErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  // Get logs from last N minutes
  public getRecentLogs(minutes: number): LogEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
  }
}

// Create singleton instance
export const logger = new ConsoleLogger();

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__consoleLogger = logger;
}

// Export type for TypeScript
export type { LogEntry };
