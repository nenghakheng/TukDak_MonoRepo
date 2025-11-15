/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { guestsApi } from '../api/guest.api';
import type { Guest } from '../models';

const QUERY_KEYS = {
  guests: 'guests',
  guestsPaginated: 'guests-paginated',
  guest: (id: string) => ['guest', id],
};

/**
 * Fetch paginated guests
 */
export const useGuestsPaginatedQuery = (params?: { 
  page?: number; 
  limit?: number;
  search?: string; 
  guest_of?: string; 
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.guestsPaginated, params],
    queryFn: () => guestsApi.getGuestsPaginated(params),
  });
};

/**
 * Fetch all guests
 */
export const useGuestsQuery = (params?: { 
  search?: string; 
  guest_of?: string; 
  page?: number; 
  limit?: number 
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.guests, params],
    queryFn: () => guestsApi.getGuests(params),
  });
};

/**
 * Fetch single guest
 */
export const useGuestQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.guest(id),
    queryFn: () => guestsApi.getGuest(id),
    enabled: !!id,
  });
};

/**
 * Create guest mutation
 */
export const useCreateGuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Guest>) => guestsApi.createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guestsPaginated] });
      toast.success('Guest created successfully! 🎉');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create guest';
      toast.error(errorMessage);
      console.error('Create guest error:', error);
    },
  });
};

/**
 * Update guest mutation
 */
export const useUpdateGuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guest> }) =>
      guestsApi.updateGuest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guestsPaginated] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guest(variables.id) });
      toast.success('Guest updated successfully! ✅');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update guest';
      toast.error(errorMessage);
      console.error('Update guest error:', error);
    },
  });
};

/**
 * Delete guest mutation
 */
export const useDeleteGuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => guestsApi.deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guestsPaginated] });
      toast.success('Guest deleted successfully! 🗑️');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to delete guest';
      toast.error(errorMessage);
      console.error('Delete guest error:', error);
    },
  });
};

/**
 * Check-in guest mutation
 */
export const useCheckInGuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      guest_id,
      data,
    }: {
      guest_id: string;
      data: {
        amount_khr: number;
        amount_usd: number;
        payment_method: string;
      };
    }) => guestsApi.updateGuest(guest_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.guestsPaginated] });
      toast.success('Guest checked in successfully! ✨');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to check in guest';
      toast.error(errorMessage);
      console.error('Check-in guest error:', error);
    },
  });
};