/**
 * Menu Item Form Component
 * Form for creating and editing menu items with multiple image uploads
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  createMenuItemFormSchema,
  updateMenuItemFormSchema,
} from "@/schemas/menu_item_schema";
import type { MenuItem, Category } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

interface MenuItemFormProps {
  menuItem?: MenuItem; // If provided, we're editing
  categories: Category[]; // Available categories
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type MenuItemFormData = {
  category_id: string;
  name: string;
  description?: string;
  price: string;
  is_available?: boolean;
  images?: File[];
};

export const MenuItemForm = ({
  menuItem,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MenuItemFormProps) => {
  const isEdit = !!menuItem;
  const schema = isEdit ? updateMenuItemFormSchema : createMenuItemFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit
      ? {
          category_id: menuItem.category_id.toString(),
          name: menuItem.name,
          description: menuItem.description || "",
          price: (menuItem.price / 100).toString(), // Convert cents to dollars
          is_available: menuItem.is_available,
        }
      : {
          category_id: "",
          name: "",
          description: "",
          price: "",
        },
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(
    menuItem?.images?.map((img) => img.image) || []
  );

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setValue("images", files);

      // Create previews for all selected files
      const readers = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setImagePreviews(previews);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);

    // Clear file input if no images left
    if (newPreviews.length === 0) {
      setValue("images", undefined);
    }
  };

  const isAvailable = watch("is_available");
  const selectedCategory = watch("category_id");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Selection */}
      <Field data-invalid={!!errors.category_id}>
        <FieldLabel>Category</FieldLabel>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue("category_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter((cat) => cat.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.category_id && (
          <FieldError>{errors.category_id.message}</FieldError>
        )}
      </Field>

      {/* Item Name */}
      <Field data-invalid={!!errors.name}>
        <FieldLabel>Item Name</FieldLabel>
        <FieldContent>
          <Input {...register("name")} placeholder="e.g., Fried Rice" />
        </FieldContent>
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      {/* Description */}
      <Field data-invalid={!!errors.description}>
        <FieldLabel>Description (Optional)</FieldLabel>
        <FieldContent>
          <Textarea
            {...register("description")}
            placeholder="Describe the dish..."
            rows={3}
          />
        </FieldContent>
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      {/* Price */}
      <Field data-invalid={!!errors.price}>
        <FieldLabel>Price</FieldLabel>
        <FieldContent>
          <Input
            {...register("price")}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </FieldContent>
        <p className="text-xs text-muted-foreground">Price in dollars</p>
        {errors.price && <FieldError>{errors.price.message}</FieldError>}
      </Field>

      {/* Images Upload */}
      <Field data-invalid={!!errors.images}>
        <FieldLabel>Images (Optional)</FieldLabel>
        <div className="space-y-3">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 transition-colors">
            <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="size-6 text-muted-foreground" />
            <span className="mt-2 text-xs text-muted-foreground">
              {imagePreviews.length > 0
                ? "Upload More Images"
                : "Upload Images"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImagesChange}
            />
          </label>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 5MB each. Multiple images allowed.
          </p>
        </div>
        {errors.images && <FieldError>{errors.images.message}</FieldError>}
      </Field>

      {/* Available Status (only for edit) */}
      {isEdit && (
        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_available"
              checked={isAvailable}
              onCheckedChange={(checked) => setValue("is_available", !!checked)}
            />
            <FieldLabel htmlFor="is_available" className="!mb-0 cursor-pointer">
              Available for order
            </FieldLabel>
          </div>
        </Field>
      )}

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Item"
            : "Create Item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
