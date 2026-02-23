/**
 * Order hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  Order,
  OrderItemInput,
  OrderType,
} from "@/types";

// Fetch all orders for a restaurant (members only)
export const useOrders = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      return api.get<Order[]>(endpoints.orders.list(restaurantId));
    },
    enabled: !!restaurantId,
    refetchOnMount: "always",
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });
};

// Fetch a single order
export const useOrder = (
  restaurantId: number | undefined,
  orderId: number | undefined
) => {
  return useQuery({
    queryKey: ["orders", restaurantId, orderId],
    queryFn: async () => {
      if (!restaurantId || !orderId) {
        throw new Error("Restaurant ID and Order ID are required");
      }
      return api.get<Order>(endpoints.orders.get(restaurantId, orderId));
    },
    enabled: !!restaurantId && !!orderId,
  });
};

// Create order for authenticated members
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      restaurantId: number;
      order_type: OrderType;
      table_id?: number;
      items: OrderItemInput[];
    }) => {
      const { restaurantId, ...orderData } = input;
      return api.post<Order>(endpoints.orders.create(restaurantId), orderData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.restaurantId],
      });
    },
  });
};

// Create order for guests (no authentication)
export const useCreateGuestOrder = () => {
  return useMutation({
    mutationFn: async (input: {
      restaurantId: number;
      token: string;
      order_type: OrderType;
      items: OrderItemInput[];
    }) => {
      const { restaurantId, token, order_type, items } = input;

      // Guest order using /restaurants/:id/orders/guest endpoint (no auth required)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${endpoints.orders.createGuest(restaurantId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            order_type: order_type,
            items: items,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      return response.json();
    },
  });
};

// Update order (members only)
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      restaurantId: number;
      orderId: number;
      order_type: OrderType;
      status: string;
      table_id?: number;
      items: OrderItemInput[];
    }) => {
      const { restaurantId, orderId, ...orderData } = input;
      return api.put<Order>(
        endpoints.orders.update(restaurantId, orderId),
        orderData
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.restaurantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.restaurantId, variables.orderId],
      });
    },
  });
};

// Delete order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      orderId,
    }: {
      restaurantId: number;
      orderId: number;
    }) => {
      return api.delete(endpoints.orders.delete(restaurantId, orderId));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.restaurantId],
      });
    },
  });
};
