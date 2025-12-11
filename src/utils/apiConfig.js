/**
 * Shared utility for determining API base URL
 * Ensures consistent API URL detection across the application
 */

export const getApiBaseUrl = () => {
  // If environment variable is explicitly set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in production by checking hostname
  const isProduction = import.meta.env.PROD || 
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'examfit.in' || 
      window.location.hostname === 'www.examfit.in' ||
      window.location.hostname.includes('examfit.in')));
  
  if (isProduction) {
    // In production, default to production backend
    return 'https://backend.examfit.in/api';
  }
  
  // In development, default to localhost
  return 'http://localhost:4000/api';
};

