import { z } from "zod";

export const tableSchema = z.object({
  table_number: z.string().min(1, "Table number is required"),
  seats: z.coerce.number().int().min(1, "At least 1 seat required").default(4),
  zone_id: z.coerce.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

export type TableFormData = z.infer<typeof tableSchema>;
