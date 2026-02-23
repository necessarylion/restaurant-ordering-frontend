/**
 * Table hooks
 * React Query hooks for table CRUD operations, floor plan, and QR code generation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Table, Zone, FloorPlanInput } from "@/types";

// ============================================================================
// Query Hooks
// ============================================================================

export const useTables = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: () => api.get<Table[]>(endpoints.tables.list(restaurantId!)),
    enabled: !!restaurantId,
    refetchOnMount: "always",
  });
};

export const useTable = (
  restaurantId: number | undefined,
  tableId: number | undefined
) => {
  return useQuery({
    queryKey: ["tables", restaurantId, tableId],
    queryFn: () =>
      api.get<Table>(endpoints.tables.get(restaurantId!, tableId!)),
    enabled: !!restaurantId && !!tableId,
    staleTime: 0,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateTableInput {
  restaurantId: number;
  table_number: string;
  seats?: number;
  zone_id?: number;
  position_x?: number;
  position_y?: number;
}

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTableInput) => {
      const { restaurantId, ...data } = input;
      return api.post<Table>(endpoints.tables.create(restaurantId), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
    },
  });
};

interface UpdateTableInput {
  restaurantId: number;
  tableId: number;
  table_number: string;
  is_active: boolean;
  seats?: number;
  zone_id?: number | null;
  position_x?: number;
  position_y?: number;
}

export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTableInput) => {
      const { restaurantId, tableId, ...data } = input;
      return api.put<Table>(
        endpoints.tables.update(restaurantId, tableId),
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId, variables.tableId],
      });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      tableId,
    }: {
      restaurantId: number;
      tableId: number;
    }) => {
      return api.delete(endpoints.tables.delete(restaurantId, tableId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
      queryClient.removeQueries({
        queryKey: ["tables", variables.restaurantId, variables.tableId],
      });
    },
  });
};

export const useSaveFloorPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      data,
    }: {
      restaurantId: number;
      data: FloorPlanInput;
    }) => {
      return api.post<Table[]>(
        endpoints.tables.floorPlan(restaurantId),
        data
      );
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["tables", variables.restaurantId],
        data
      );
    },
  });
};

export const useGenerateTableToken = () => {
  return useMutation({
    mutationFn: async ({
      restaurantId,
      tableId,
    }: {
      restaurantId: number;
      tableId: number;
    }) => {
      return api.post<{ token: string; expires_at: string }>(
        endpoints.tables.generateToken(restaurantId, tableId)
      );
    },
  });
};

// ============================================================================
// Zone Hooks
// ============================================================================

export const useZones = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["zones", restaurantId],
    queryFn: () => api.get<Zone[]>(endpoints.zones.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      name,
      color,
    }: {
      restaurantId: number;
      name: string;
      color?: string;
    }) => {
      return api.post<Zone>(endpoints.zones.create(restaurantId), {
        name,
        color,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.restaurantId],
      });
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      zoneId,
      name,
      color,
    }: {
      restaurantId: number;
      zoneId: number;
      name: string;
      color?: string;
    }) => {
      return api.put<Zone>(endpoints.zones.update(restaurantId, zoneId), {
        name,
        color,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.restaurantId],
      });
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      zoneId,
    }: {
      restaurantId: number;
      zoneId: number;
    }) => {
      return api.delete(endpoints.zones.delete(restaurantId, zoneId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
    },
  });
};
