/**
 * Restaurant CRUD hooks using React Query
 * Provides type-safe restaurant operations with caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  Restaurant,
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "@/types";

/**
 * Fetch all restaurants for current user
 */
export const useRestaurants = () => {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: () => api.get<Restaurant[]>(endpoints.restaurants.list),
  });
};

/**
 * Fetch single restaurant by ID
 */
export const useRestaurantById = (id: number | undefined) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => api.get<Restaurant>(endpoints.restaurants.get(id!)),
    enabled: !!id, // Only fetch if ID exists
  });
};

/**
 * Create new restaurant
 */
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantInput) =>
      api.post<Restaurant>(endpoints.restaurants.create, data),
    onSuccess: (newRestaurant) => {
      // Invalidate restaurants list to refetch
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });

      // Optimistically add to cache
      queryClient.setQueryData<Restaurant[]>(["restaurants"], (old = []) => [
        ...old,
        newRestaurant,
      ]);
    },
  });
};

/**
 * Update existing restaurant
 */
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRestaurantInput }) =>
      api.put<Restaurant>(endpoints.restaurants.update(id), data),
    onSuccess: (updatedRestaurant) => {
      // Update in cache
      queryClient.setQueryData<Restaurant>(
        ["restaurant", updatedRestaurant.id],
        updatedRestaurant
      );

      // Update in restaurants list
      queryClient.setQueryData<Restaurant[]>(["restaurants"], (old = []) =>
        old.map((r) => (r.id === updatedRestaurant.id ? updatedRestaurant : r))
      );
    },
  });
};

/**
 * Delete restaurant
 */
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(endpoints.restaurants.delete(id)),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["restaurant", deletedId] });

      // Remove from restaurants list
      queryClient.setQueryData<Restaurant[]>(["restaurants"], (old = []) =>
        old.filter((r) => r.id !== deletedId)
      );
    },
  });
};
