/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: '/api', // Use Vite proxy in development
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  PING: '/ping',
} as const;
