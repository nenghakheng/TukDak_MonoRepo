import type {
  Guest,
  GuestResponse,
  GuestsResponse,
  PingResponse,
} from "../models";
import { ApiService } from "./client";
import { API_ENDPOINTS } from "./config";

/**
 * Ping API
 */
export const pingApi = {
  getPing: () => ApiService.get<PingResponse>(API_ENDPOINTS.PING),
  postPing: () => ApiService.post<PingResponse>(API_ENDPOINTS.PING),
};

/**
 * Guests API
 */
export const guestsApi = {
  getGuests: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => ApiService.get<GuestsResponse>(API_ENDPOINTS.GUESTS, { params }),

  getGuestsPaginated: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    guest_of?: string;
  }) =>
    ApiService.get<{
      success: boolean;
      data: {
        data: Guest[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>(`${API_ENDPOINTS.GUESTS}/paginated`, { params }),

  getGuest: (id: string) =>
    ApiService.get<GuestResponse>(`${API_ENDPOINTS.GUESTS}/${id}`),

  createGuest: (data: Partial<Guest>) =>
    ApiService.post<GuestResponse, Partial<Guest>>(API_ENDPOINTS.GUESTS, data),

  updateGuest: (id: string, data: Partial<Guest>) =>
    ApiService.patch<GuestResponse, Partial<Guest>>(
      `${API_ENDPOINTS.GUESTS}/${id}`,
      data
    ),

  deleteGuest: (id: string) =>
    ApiService.delete<{ success: boolean }>(`${API_ENDPOINTS.GUESTS}/${id}`),
};
