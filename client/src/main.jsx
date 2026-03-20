import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';

if (typeof document !== 'undefined') {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
