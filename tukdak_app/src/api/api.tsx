/**
 * API Layer - All API calls should be defined here
 */
import { ApiService } from "./client";
import { API_ENDPOINTS } from "./config";
import type { PingResponse } from "../models";

/**
 * Ping API
 */
export const pingApi = {
  /**
   * Test connection to the server
   */
  ping: async (): Promise<PingResponse> => {
    return ApiService.get<PingResponse>(API_ENDPOINTS.PING);
  },
};

// Export all API modules
export const api = {
  ping: pingApi,
};
