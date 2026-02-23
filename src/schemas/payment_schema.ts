import { z } from "zod";

export const paymentSchema = z.object({
  table_id: z.number().int().positive("Table is required"),
  discount: z.number().min(0, "Discount must be 0 or greater").optional(),
});

export const createPaymentFormSchema = z.object({
  table_id: z.string().min(1, "Table is required"),
  discount: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), "Discount must be a number")
    .transform((val) => (val ? Number(val) : undefined)),
});

export type PaymentFormData = z.infer<typeof createPaymentFormSchema>;
