import { z } from "zod";
import { OrderStatus, OrderType } from "@/types/models";

export const orderItemSchema = z.object({
  menu_item_id: z.number().int().positive(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  order_type: z.nativeEnum(OrderType),
  table_id: z.number().int().positive().optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must have at least one item"),
});

export const updateOrderSchema = createOrderSchema.extend({
  status: z.nativeEnum(OrderStatus),
});

export type OrderFormData = z.infer<typeof createOrderSchema>;
