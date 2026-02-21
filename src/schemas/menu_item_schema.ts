import { z } from "zod";

export const menuItemSchema = z.object({
  category_id: z.number().int().positive("Category is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().int().min(0, "Price must be 0 or greater"),
  is_available: z.boolean().default(true),
});

export const createMenuItemFormSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)), "Price must be a number")
    .transform((val) => Math.round(Number(val) * 100)), // Convert to cents
  images: z
    .array(z.instanceof(File))
    .optional()
    .refine(
      (files) => !files || files.every((f) => f.size <= 5 * 1024 * 1024),
      "Each image must be less than 5MB"
    )
    .refine(
      (files) =>
        !files ||
        files.every((f) =>
          ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
        ),
      "Only JPG, PNG, and WebP images are allowed"
    ),
});

export const updateMenuItemFormSchema = createMenuItemFormSchema.extend({
  is_available: z.boolean().default(true),
});

export type MenuItemFormData = z.infer<typeof createMenuItemFormSchema>;
