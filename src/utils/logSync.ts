/**
 * Log Sync for Claude Code Integration
 *
 * Periodically syncs captured console logs to the log server
 * so Claude Code can read them for debugging assistance.
 */

import { consoleLogger } from './consoleLogger';

class LogSync {
  private syncInterval: number;
  private lastSyncTimestamp: number = 0;
  private intervalId: number | null = null;
  private serverUrl: string;
  private enabled: boolean;

  constructor() {
    // Read configuration from environment
    this.serverUrl = import.meta.env.VITE_LOG_SERVER_URL || 'http://localhost:3001';
    this.syncInterval = parseInt(import.meta.env.VITE_LOG_SYNC_INTERVAL || '2000', 10);
    this.enabled = import.meta.env.VITE_LOG_SYNC_ENABLED === 'true';

    if (this.enabled) {
      this.start();
    } else {
      console.log('[LogSync] Disabled - Set VITE_LOG_SYNC_ENABLED=true to enable');
    }
  }

  /**
   * Start syncing logs to server
   */
  private start() {
    console.log(`[LogSync] Starting sync to ${this.serverUrl} every ${this.syncInterval}ms`);

    // Sync immediately
    this.sync();

    // Set up interval for periodic syncing
    this.intervalId = window.setInterval(() => {
      this.sync();
    }, this.syncInterval);
  }

  /**
   * Stop syncing logs
   */
  public stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LogSync] Stopped');
    }
  }

  /**
   * Sync logs to server
   */
  private async sync() {
    try {
      // Get logs since last sync
      const logs = consoleLogger.getLogsSince(this.lastSyncTimestamp);

      if (logs.length === 0) {
        return; // Nothing to sync
      }

      // Send to server
      const response = await fetch(`${this.serverUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();

      // Log success (only occasionally to avoid spam)
      if (logs.length > 0) {
        console.debug(`[LogSync] Synced ${logs.length} logs`);
      }
    } catch (error) {
      // Don't spam errors - only log occasionally
      if (Math.random() < 0.1) {
        console.error('[LogSync] Failed to sync logs:', error);
      }
    }
  }

  /**
   * Manually trigger a sync
   */
  public syncNow() {
    return this.sync();
  }

  /**
   * Clear logs on server
   */
  public async clearServerLogs() {
    try {
      const response = await fetch(`${this.serverUrl}/api/logs`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      console.log('[LogSync] Server logs cleared');
      this.lastSyncTimestamp = Date.now();
    } catch (error) {
      console.error('[LogSync] Failed to clear server logs:', error);
    }
  }
}

// Create singleton instance
const logSync = new LogSync();

// Make it available globally for manual control
if (typeof window !== 'undefined') {
  (window as any).__logSync = logSync;
}

export { logSync };
