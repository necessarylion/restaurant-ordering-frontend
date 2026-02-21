import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
});

export const createCategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  sort_order: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 3)),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "Only JPG, PNG, and WebP images are allowed"
    ),
});

export const updateCategoryFormSchema = createCategoryFormSchema.extend({
  is_active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof createCategoryFormSchema>;
