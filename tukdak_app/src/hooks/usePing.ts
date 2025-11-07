/**
 * Custom hook for Ping API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { PingResponse } from '../models';

/**
 * Query keys for caching
 */
export const pingQueryKeys = {
  all: ['ping'] as const,
  detail: () => [...pingQueryKeys.all, 'detail'] as const,
};

/**
 * Hook to fetch ping data
 */
export const usePing = () => {
  return useQuery({
    queryKey: pingQueryKeys.detail(),
    queryFn: () => api.ping.ping(),
    staleTime: 5000, // Data is fresh for 5 seconds
    retry: 2,
  });
};

/**
 * Hook to mutate ping (for POST/PUT operations if needed)
 * This is an example - the ping endpoint is typically GET only
 */
export const usePingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.ping.ping(),
    onSuccess: (data: PingResponse) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: pingQueryKeys.all });
      console.log('Ping successful:', data);
    },
    onError: (error) => {
      console.error('Ping failed:', error);
    },
  });
};

/**
 * Hook to access query client
 */
export const usePingQueryClient = () => {
  return useQueryClient();
};
