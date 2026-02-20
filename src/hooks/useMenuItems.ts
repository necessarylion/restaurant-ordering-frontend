/**
 * Menu Item hooks
 * React Query hooks for menu item CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { MenuItem } from "@/types";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all menu items for a restaurant
 */
export const useMenuItems = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["menuItems", restaurantId],
    queryFn: () =>
      api.get<MenuItem[]>(endpoints.menuItems.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

/**
 * Fetch a single menu item by ID
 */
export const useMenuItem = (
  restaurantId: number | undefined,
  itemId: number | undefined
) => {
  return useQuery({
    queryKey: ["menuItems", restaurantId, itemId],
    queryFn: () =>
      api.get<MenuItem>(endpoints.menuItems.get(restaurantId!, itemId!)),
    enabled: !!restaurantId && !!itemId,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateMenuItemInput {
  restaurantId: number;
  category_id: string;
  name: string;
  description?: string;
  price: number; // in cents
  images?: File[];
}

/**
 * Create a new menu item with optional multiple images
 */
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMenuItemInput) => {
      const { restaurantId, category_id, name, description, price, images } =
        input;

      // Build FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append("category_id", category_id);
      formData.append("name", name);
      if (description) {
        formData.append("description", description);
      }
      formData.append("price", price.toString());

      // Append multiple images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      return api.post<MenuItem>(
        endpoints.menuItems.create(restaurantId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate menu items list to refetch
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId],
      });
    },
  });
};

interface UpdateMenuItemInput {
  restaurantId: number;
  itemId: number;
  category_id?: string;
  name?: string;
  description?: string;
  price?: number; // in cents
  is_available?: boolean;
  images?: File[];
}

/**
 * Update an existing menu item
 */
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMenuItemInput) => {
      const {
        restaurantId,
        itemId,
        category_id,
        name,
        description,
        price,
        is_available,
        images,
      } = input;

      // Build FormData for multipart/form-data submission
      const formData = new FormData();
      if (category_id !== undefined) {
        formData.append("category_id", category_id);
      }
      if (name !== undefined) {
        formData.append("name", name);
      }
      if (description !== undefined) {
        formData.append("description", description);
      }
      if (price !== undefined) {
        formData.append("price", price.toString());
      }
      if (is_available !== undefined) {
        formData.append("is_available", is_available.toString());
      }

      // Append multiple images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      return api.put<MenuItem>(
        endpoints.menuItems.update(restaurantId, itemId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and single menu item queries
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId, variables.itemId],
      });
    },
  });
};

/**
 * Delete a menu item
 */
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      itemId,
    }: {
      restaurantId: number;
      itemId: number;
    }) => {
      return api.delete(endpoints.menuItems.delete(restaurantId, itemId));
    },
    onSuccess: (_, variables) => {
      // Invalidate menu items list
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId],
      });
      // Remove the specific menu item from cache
      queryClient.removeQueries({
        queryKey: ["menuItems", variables.restaurantId, variables.itemId],
      });
    },
  });
};
