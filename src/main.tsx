/**
 * @file main.tsx
 * @description Main entry point for the application
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import React from 'react';

// --- Core-related Libraries ---
import { BrowserRouter as Router } from 'react-router-dom';

// --- Third-party Libraries ---
import ReactDOM from 'react-dom/client';

// --- Relative Imports ---
import App from './App';
import './i18n';
import './styles/index.css';

// =================================================================================================
// Render
// =================================================================================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>
);
