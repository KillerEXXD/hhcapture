// src/components/LogManager.tsx
// Optional UI component for managing console logs
// Add this to your app for a visual interface

import React, { useState, useEffect } from 'react';
import { logger } from '../utils/consoleLogger';

export function LogManager() {
  const [isVisible, setIsVisible] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Update counts every second
    const interval = setInterval(() => {
      setLogCount(logger.getLogCount());
      setErrorCount(logger.getErrors().length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    logger.downloadLogs();
  };

  const handleCopy = async () => {
    const success = await logger.copyToClipboard();
    if (success) {
      alert('Logs copied to clipboard! Paste them into Claude.');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all captured logs?')) {
      logger.clearLogs();
      setLogCount(0);
      setErrorCount(0);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 16px',
          background: errorCount > 0 ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: '500'
        }}
        title="Click to open log manager"
      >
        📋 Logs: {logCount}
        {errorCount > 0 && <span style={{ color: '#ffeb3b' }}> ⚠️ {errorCount}</span>}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: '#007bff',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Console Logs</strong>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {logCount} entries
            {errorCount > 0 && <span style={{ color: '#ffeb3b' }}> • {errorCount} errors</span>}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#666' }}>
          Keyboard shortcuts:
          <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
            Ctrl+Shift+L → Download<br/>
            Ctrl+Shift+C → Copy<br/>
            Ctrl+Shift+X → Clear
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleDownload}
            style={{
              padding: '10px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📥 Download Logs
          </button>

          <button
            onClick={handleCopy}
            style={{
              padding: '10px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 Copy to Clipboard
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '10px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🗑️ Clear Logs
          </button>
        </div>

        {errorCount > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#856404'
          }}>
            ⚠️ {errorCount} error{errorCount !== 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    </div>
  );
}
