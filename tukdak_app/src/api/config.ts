/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: '/api',
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
  GUESTS: '/guests',
};
