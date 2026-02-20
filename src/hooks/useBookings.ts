/**
 * Booking hooks
 * React Query hooks for booking CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Booking, CreateBookingInput, UpdateBookingInput } from "@/types";

// ============================================================================
// Query Hooks
// ============================================================================

export const useBookings = (
  restaurantId: number | undefined,
  filters?: {
    table_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }
) => {
  return useQuery({
    queryKey: ["bookings", restaurantId, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.table_id) params.set("table_id", String(filters.table_id));
      if (filters?.status) params.set("status", filters.status);
      if (filters?.date_from) params.set("date_from", filters.date_from);
      if (filters?.date_to) params.set("date_to", filters.date_to);
      const query = params.toString();
      const url = endpoints.bookings.list(restaurantId!) + (query ? `?${query}` : "");
      return api.get<Booking[]>(url);
    },
    enabled: !!restaurantId,
  });
};

export const useBooking = (
  restaurantId: number | undefined,
  bookingId: number | undefined
) => {
  return useQuery({
    queryKey: ["bookings", restaurantId, bookingId],
    queryFn: () =>
      api.get<Booking>(endpoints.bookings.get(restaurantId!, bookingId!)),
    enabled: !!restaurantId && !!bookingId,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateBookingMutationInput extends CreateBookingInput {
  restaurantId: number;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookingMutationInput) => {
      const { restaurantId, ...data } = input;
      return api.post<Booking>(endpoints.bookings.create(restaurantId), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.restaurantId],
      });
    },
  });
};

interface UpdateBookingMutationInput extends UpdateBookingInput {
  restaurantId: number;
  bookingId: number;
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBookingMutationInput) => {
      const { restaurantId, bookingId, ...data } = input;
      return api.put<Booking>(
        endpoints.bookings.update(restaurantId, bookingId),
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.restaurantId],
      });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      bookingId,
    }: {
      restaurantId: number;
      bookingId: number;
    }) => {
      return api.delete(endpoints.bookings.delete(restaurantId, bookingId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.restaurantId],
      });
    },
  });
};
