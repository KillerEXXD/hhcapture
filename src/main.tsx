import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize console logger and sync for Claude Code integration
import './utils/consoleLogger';
import './utils/logSync';

console.log('[Main] App starting with automated console log capture');

// Note: LogRocket is initialized in LogRocketControl component when user starts recording
// This ensures proper user identification before session data is sent

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
