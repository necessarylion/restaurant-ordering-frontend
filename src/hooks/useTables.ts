/**
 * Table hooks
 * React Query hooks for table CRUD operations and QR code generation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Table } from "@/types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all tables for a restaurant
 */
export const useTables = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: () => api.get<Table[]>(endpoints.tables.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

/**
 * Fetch a single table by ID
 */
export const useTable = (
  restaurantId: number | undefined,
  tableId: number | undefined
) => {
  return useQuery({
    queryKey: ["tables", restaurantId, tableId],
    queryFn: () =>
      api.get<Table>(endpoints.tables.get(restaurantId!, tableId!)),
    enabled: !!restaurantId && !!tableId,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateTableInput {
  restaurantId: number;
  table_number: string;
  is_active?: boolean;
}

/**
 * Create a new table
 */
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
  table_number?: string;
  is_active?: boolean;
}

/**
 * Update an existing table
 */
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

/**
 * Delete a table
 */
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

/**
 * Generate order token (QR code) for a table
 */
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
