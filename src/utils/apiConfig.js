/**
 * Shared utility for determining API base URL
 * Ensures consistent API URL detection across the application
 */

export const getApiBaseUrl = () => {
  // Always check hostname at runtime for accurate detection
  // This ensures it works even if build-time env vars are incorrect
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if we're on production domain
    if (hostname === 'examfit.in' || 
        hostname === 'www.examfit.in' ||
        hostname.includes('examfit.in')) {
      // In production, use production backend
      return 'https://backend.examfit.in/api';
    }
    
    // If explicitly set via environment variable, use it
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  }
  
  // Fallback: check build-time environment
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (import.meta.env.PROD) {
    return 'https://backend.examfit.in/api';
  }
  
  // In development, default to localhost
  return 'http://localhost:4000/api';
};

