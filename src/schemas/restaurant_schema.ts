import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().optional(),
  logo: z.instanceof(FileList).optional(),
  booking_window_start_hours: z.number().int().min(0).optional(),
  booking_window_end_hours: z.number().int().min(0).optional(),
  tax_percent: z.number().min(0).max(100).optional(),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;
