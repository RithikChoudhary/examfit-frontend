import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { initializeErrorHandling } from './utils/errorLogger';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './css/base.css';

// Initialize error handling before rendering
initializeErrorHandling();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

