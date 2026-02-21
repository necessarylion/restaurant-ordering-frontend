import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().optional(),
  logo: z.instanceof(FileList).optional(),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;
