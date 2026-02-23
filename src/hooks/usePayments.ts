/**
 * Payment hooks
 * React Query hooks for payment operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Payment, CreatePaymentInput } from "@/types";

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
