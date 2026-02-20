/**
 * Zod validation schemas
 * Provides runtime validation and TypeScript type inference for forms
 */

import { z } from "zod";
import { OrderStatus, OrderType, Role } from "@/types/models";

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// ============================================================================
// Restaurant Schemas
// ============================================================================

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

// ============================================================================
// Category Schemas
// ============================================================================

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
    .transform((val) => (val ? parseInt(val, 10) : 0)),
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

// ============================================================================
// Menu Item Schemas
// ============================================================================

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

// ============================================================================
// Table Schemas
// ============================================================================

export const tableSchema = z.object({
  table_number: z.string().min(1, "Table number is required"),
  seats: z.coerce.number().int().min(1, "At least 1 seat required").default(4),
  zone_id: z.coerce.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// Order Schemas
// ============================================================================

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

// ============================================================================
// Payment Schemas
// ============================================================================

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

// ============================================================================
// Member Schemas
// ============================================================================

export const inviteMemberSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum([Role.ADMIN, Role.STAFF]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([Role.ADMIN, Role.STAFF]),
});

// ============================================================================
// Type Inference (for use in components)
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RestaurantFormData = z.infer<typeof restaurantSchema>;
export type CategoryFormData = z.infer<typeof createCategoryFormSchema>;
export type MenuItemFormData = z.infer<typeof createMenuItemFormSchema>;
export type TableFormData = z.infer<typeof tableSchema>;
export type OrderFormData = z.infer<typeof createOrderSchema>;
export type PaymentFormData = z.infer<typeof createPaymentFormSchema>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
