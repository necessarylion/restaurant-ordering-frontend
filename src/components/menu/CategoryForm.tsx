/**
 * Category Form Component
 * Form for creating and editing categories with image upload
 */

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createCategoryFormSchema, updateCategoryFormSchema } from "@/schemas/category_schema";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { SORT_ORDER_OPTIONS } from "@/lib/sort-order";

interface CategoryFormProps {
  category?: Category; // If provided, we're editing
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type CategoryFormData = {
  name: string;
  sort_order: string;
  is_active?: boolean;
  image?: File;
};

export const CategoryForm = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CategoryFormProps) => {
  const isEdit = !!category;
  const schema = isEdit ? updateCategoryFormSchema : createCategoryFormSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit
      ? {
          name: category.name,
          sort_order: category.sort_order?.toString() || "3",
          is_active: category.is_active,
        }
      : {
          name: "",
          sort_order: "3",
        },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setValue("image", undefined);
    setImagePreview(category?.image || null);
  };

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Name */}
      <Field data-invalid={!!errors.name}>
        <FieldLabel>Category Name</FieldLabel>
        <FieldContent>
          <Input {...register("name")} placeholder="e.g., Appetizers, Main Course" />
        </FieldContent>
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      {/* Sort Order */}
      <Field data-invalid={!!errors.sort_order}>
        <FieldLabel>Sort Order</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="sort_order"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_ORDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className={option.color}>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldContent>
        {errors.sort_order && <FieldError>{errors.sort_order.message}</FieldError>}
      </Field>

      {/* Image Upload */}
      <Field data-invalid={!!errors.image}>
        <FieldLabel>Category Image</FieldLabel>
        <div className="space-y-2">
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Category preview"
                className="h-32 w-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2"
                onClick={handleRemoveImage}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
              </Button>
            </div>
          ) : (
            <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 transition-colors">
              <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="size-6 text-muted-foreground" />
              <span className="mt-2 text-xs text-muted-foreground">
                Upload Image
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 5MB.
          </p>
        </div>
        {errors.image && <FieldError>{errors.image.message}</FieldError>}
      </Field>

      {/* Active Status (only for edit) */}
      {isEdit && (
        <Field>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", !!checked)}
            />
            <FieldLabel htmlFor="is_active" className="!mb-0 cursor-pointer">
              Enable
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
            ? "Update Category"
            : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
