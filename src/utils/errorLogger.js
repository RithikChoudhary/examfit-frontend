/**
 * Centralized Error Logging Utility
 * Logs all frontend errors with detailed information
 */

// Use shared API URL utility
import { getApiBaseUrl } from './apiConfig';
const API_BASE_URL = getApiBaseUrl();

/**
 * Log error with detailed information
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : null,
    context: context,
    // API error details
    response: error?.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      url: error.config?.url,
      method: error.config?.method,
    } : null,
  };

  // Console logging with styling
  console.group('%c🚨 Frontend Error', 'color: #EF4444; font-weight: bold; font-size: 14px;');
  console.error('Error Details:', errorInfo);
  console.error('Full Error Object:', error);
  if (error?.response) {
    console.error('API Response:', error.response);
    console.error('Request Config:', error.config);
  }
  console.groupEnd();

  // Try to send to backend for tracking (non-blocking)
  sendErrorToBackend(errorInfo).catch(err => {
    console.warn('Failed to send error to backend:', err);
  });

  return errorInfo;
};

/**
 * Send error to backend for tracking
 */
const sendErrorToBackend = async (errorInfo) => {
  try {
    // Only send in production or if explicitly enabled
    if (!import.meta.env.PROD && !import.meta.env.VITE_ENABLE_ERROR_LOGGING) {
      return;
    }

    await fetch(`${API_BASE_URL}/errors/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorInfo),
    }).catch(() => {
      // Silently fail - don't break the app if error logging fails
    });
  } catch (err) {
    // Silently fail
  }
};

/**
 * Initialize global error handlers
 */
export const initializeErrorHandling = () => {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), {
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, {
      type: 'unhandled_promise_rejection',
      promise: event.promise,
    });
  });

  // Override console.error to capture all console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    
    // Log if it looks like an error object
    if (args[0] instanceof Error) {
      logError(args[0], { type: 'console_error' });
    }
  };

  console.log('%c✅ Error logging initialized', 'color: #10B981; font-weight: bold;');
};

/**
 * Log API errors with context
 */
export const logApiError = (error, context = {}) => {
  const errorInfo = {
    ...logError(error, { type: 'api_error', ...context }),
    apiContext: {
      endpoint: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      params: error.config?.params,
      data: error.config?.data,
    },
  };

  return errorInfo;
};

/**
 * Log component errors (for React Error Boundaries)
 */
export const logComponentError = (error, errorInfo) => {
  return logError(error, {
    type: 'react_component_error',
    componentStack: errorInfo?.componentStack,
  });
};

