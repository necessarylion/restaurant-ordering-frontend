/**
 * Category hooks
 * React Query hooks for category CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Category } from "@/types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all categories for a restaurant
 */
export const useCategories = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["categories", restaurantId],
    refetchOnMount: "always",
    queryFn: () =>
      api.get<Category[]>(endpoints.categories.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

/**
 * Fetch a single category by ID
 */
export const useCategory = (
  restaurantId: number | undefined,
  categoryId: number | undefined
) => {
  return useQuery({
    queryKey: ["categories", restaurantId, categoryId],
    queryFn: () =>
      api.get<Category>(
        endpoints.categories.get(restaurantId!, categoryId!)
      ),
    enabled: !!restaurantId && !!categoryId,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateCategoryInput {
  restaurantId: number;
  name: string;
  sort_order?: number;
  image?: File;
}

/**
 * Create a new category with optional image upload
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { restaurantId, name, sort_order, image } = input;

      // Build FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append("name", name);
      if (sort_order !== undefined) {
        formData.append("sort_order", sort_order.toString());
      }
      if (image) {
        formData.append("image", image);
      }

      return api.post<Category>(
        endpoints.categories.create(restaurantId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.restaurantId],
      });
    },
  });
};

interface UpdateCategoryInput {
  restaurantId: number;
  categoryId: number;
  name?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: File;
}

/**
 * Update an existing category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const { restaurantId, categoryId, name, sort_order, is_active, image } =
        input;

      // Build FormData for multipart/form-data submission
      const formData = new FormData();
      if (name !== undefined) {
        formData.append("name", name);
      }
      if (sort_order !== undefined) {
        formData.append("sort_order", sort_order.toString());
      }
      if (is_active !== undefined) {
        formData.append("is_active", is_active.toString());
      }
      if (image) {
        formData.append("image", image);
      }

      return api.put<Category>(
        endpoints.categories.update(restaurantId, categoryId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and single category queries
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.restaurantId, variables.categoryId],
      });
    },
  });
};

/**
 * Delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      categoryId,
    }: {
      restaurantId: number;
      categoryId: number;
    }) => {
      return api.delete(endpoints.categories.delete(restaurantId, categoryId));
    },
    onSuccess: (_, variables) => {
      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: ["categories", variables.restaurantId],
      });
      // Remove the specific category from cache
      queryClient.removeQueries({
        queryKey: ["categories", variables.restaurantId, variables.categoryId],
      });
    },
  });
};
