/**
 * Dashboard hook using React Query
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DashboardResponse } from "@/types";

export const useDashboard = (
  restaurantId: number | undefined,
  dateFrom: string,
  dateTo: string
) => {
  return useQuery({
    queryKey: ["dashboard", restaurantId, dateFrom, dateTo],
    queryFn: async () => {
      if (!restaurantId) throw new Error("Restaurant ID is required");
      return api.get<DashboardResponse>(endpoints.dashboard.get(restaurantId), {
        params: { date_from: dateFrom, date_to: dateTo },
      });
    },
    enabled: !!restaurantId && !!dateFrom && !!dateTo,
  });
};
