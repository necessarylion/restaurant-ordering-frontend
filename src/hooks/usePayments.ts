/**
 * Payment hooks
 * React Query hooks for payment operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Payment, CreatePaymentInput } from "@/types";

/**
 * Fetch all payments for a restaurant
 */
export const usePayments = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["payments", restaurantId],
    queryFn: () => api.get<Payment[]>(endpoints.payments.list(restaurantId!)),
    enabled: !!restaurantId,
    refetchOnMount: "always",
  });
};

interface CreatePaymentMutationInput extends CreatePaymentInput {
  restaurantId: number;
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentMutationInput) => {
      const { restaurantId, ...data } = input;
      return api.post<Payment>(endpoints.payments.create(restaurantId), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
    },
  });
};

/**
 * Delete (rollback) a payment
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, paymentId }: { restaurantId: number; paymentId: number }) =>
      api.delete(endpoints.payments.delete(restaurantId, paymentId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", variables.restaurantId],
      });
    },
  });
};
