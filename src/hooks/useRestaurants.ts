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
    refetchOnMount: "always",
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
 * Fetch restaurant details for guest (no auth, uses X-Order-Token)
 */
export const useGuestRestaurant = (
  restaurantId: number | undefined,
  token: string | undefined
) => {
  return useQuery({
    queryKey: ["guestRestaurant", restaurantId, token],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${endpoints.restaurants.guest(restaurantId!)}`,
        {
          headers: {
            "X-Order-Token": token!,
          },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch restaurant");
      }
      return response.json() as Promise<Restaurant>;
    },
    enabled: !!restaurantId && !!token,
  });
};

/**
 * Build FormData from restaurant input
 */
const buildRestaurantFormData = (
  data: CreateRestaurantInput | UpdateRestaurantInput
): FormData => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.address) formData.append("address", data.address);
  if (data.phone) formData.append("phone", data.phone);
  if (data.currency) formData.append("currency", data.currency);
  if (data.logo) formData.append("logo", data.logo);
  if (data.booking_window_start_hours !== undefined)
    formData.append("booking_window_start_hours", String(data.booking_window_start_hours));
  if (data.booking_window_end_hours !== undefined)
    formData.append("booking_window_end_hours", String(data.booking_window_end_hours));
  if (data.tax_percent !== undefined)
    formData.append("tax_percent", String(data.tax_percent));
  if (data.remove_decimal !== undefined)
    formData.append("remove_decimal", String(data.remove_decimal));
  return formData;
};

/**
 * Create new restaurant
 */
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantInput) =>
      api.post<Restaurant>(endpoints.restaurants.create, buildRestaurantFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
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
      api.put<Restaurant>(endpoints.restaurants.update(id), buildRestaurantFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (updatedRestaurant) => {
      queryClient.setQueryData<Restaurant>(
        ["restaurant", updatedRestaurant.id],
        updatedRestaurant
      );
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
