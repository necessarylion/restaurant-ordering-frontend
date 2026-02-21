import { z } from "zod";

export const paymentSchema = z.object({
  table_id: z.number().int().positive("Table is required"),
  order_ids: z.array(z.number().int().positive()).optional(),
  sub_total: z.number().int().min(0, "Subtotal must be 0 or greater"),
  tax: z.number().int().min(0, "Tax must be 0 or greater"),
  discount: z.number().int().min(0, "Discount must be 0 or greater").optional(),
  total: z.number().int().min(0, "Total must be 0 or greater"),
});

export const createPaymentFormSchema = z.object({
  table_id: z.string().min(1, "Table is required"),
  order_ids: z.array(z.number().int().positive()).optional(),
  sub_total: z
    .string()
    .min(1, "Subtotal is required")
    .refine((val) => !isNaN(Number(val)), "Subtotal must be a number")
    .transform((val) => Math.round(Number(val) * 100)),
  tax: z
    .string()
    .min(1, "Tax is required")
    .refine((val) => !isNaN(Number(val)), "Tax must be a number")
    .transform((val) => Math.round(Number(val) * 100)),
  discount: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), "Discount must be a number")
    .transform((val) => (val ? Math.round(Number(val) * 100) : 0)),
  total: z
    .string()
    .min(1, "Total is required")
    .refine((val) => !isNaN(Number(val)), "Total must be a number")
    .transform((val) => Math.round(Number(val) * 100)),
});

export type PaymentFormData = z.infer<typeof createPaymentFormSchema>;
