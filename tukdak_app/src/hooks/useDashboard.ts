import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface DashboardStats {
  total_guests: number;
  total_khr: number;
  total_usd: number;
  paid_guests: number;
  pending_guests: number;
  duplicates: number;
  payment_methods: {
    qr_code: number;
    cash: number;
    pending: number;
  };
  guest_distribution: {
    bride: number;
    groom: number;
    bride_parents: number;
    groom_parents: number;
    bride_sibling?: number;
    groom_sibling?: number;
  };
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/guests-stats");
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
