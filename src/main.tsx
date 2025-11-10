import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize console logger and sync for Claude Code integration
import './utils/consoleLogger';
import './utils/logSync';

console.log('[Main] App starting with automated console log capture');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
