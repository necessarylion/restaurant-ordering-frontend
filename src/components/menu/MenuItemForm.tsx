/**
 * Menu Item Form Component
 * Form for creating and editing menu items with multiple image uploads
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          price: menuItem.price.toString(),
          is_available: menuItem.is_available,
        }
      : {
          category_id: "",
          name: "",
          description: "",
          price: "",
        },
  });

  // All images as File objects (existing converted from URL + newly added)
  const [, setAllFiles] = useState<File[]>([]);
  const [allPreviews, setAllPreviews] = useState<string[]>([]);
  const existingConverted = useRef(false);

  // Convert existing image URLs to File objects on mount (edit mode)
  useEffect(() => {
    if (!menuItem?.images?.length || existingConverted.current) return;
    existingConverted.current = true;

    const urls = menuItem.images.map((img) => img.image);
    setAllPreviews(urls);

    Promise.all(
      urls.map(async (url, i) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        return new File([blob], `existing-${i}.${ext}`, { type: blob.type });
      })
    ).then((files) => {
      setAllFiles(files);
      setValue("images", files);
    });
  }, [menuItem, setValue]);

  const imagePreviews = allPreviews;

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Create previews for new files
      const readers = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((previews) => {
        setAllPreviews((prev) => [...prev, ...previews]);
      });

      setAllFiles((prev) => {
        const updated = [...prev, ...files];
        setValue("images", updated);
        return updated;
      });
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setAllPreviews((prev) => prev.filter((_, i) => i !== index));
    setAllFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue("images", updated.length > 0 ? updated : undefined);
      return updated;
    });
  };

  const isAvailable = watch("is_available");
  const selectedCategory = watch("category_id");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
      <div className="overflow-y-auto flex-1 space-y-6 px-4 pb-1">
      {/* Item Name */}
      <Field data-invalid={!!errors.name}>
        <FieldLabel>{t("menu.itemName")}</FieldLabel>
        <FieldContent>
          <Input {...register("name")} placeholder={t("menu.itemNamePlaceholder")} />
        </FieldContent>
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      {/* Category & Price Row */}
      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!errors.category_id}>
          <FieldLabel>{t("menu.category")}</FieldLabel>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue("category_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("menu.selectCategory")} />
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

        <Field data-invalid={!!errors.price}>
          <FieldLabel>{t("menu.price")}</FieldLabel>
          <FieldContent>
            <Input
              {...register("price")}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </FieldContent>
          {errors.price && <FieldError>{errors.price.message}</FieldError>}
        </Field>
      </div>

      {/* Description */}
      <Field data-invalid={!!errors.description}>
        <FieldLabel>{t("menu.descriptionOptional")}</FieldLabel>
        <FieldContent>
          <Textarea
            {...register("description")}
            placeholder={t("menu.descriptionPlaceholder")}
            rows={3}
          />
        </FieldContent>
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      {/* Images Upload */}
      <Field data-invalid={!!errors.images}>
        <FieldLabel>{t("menu.imagesOptional")}</FieldLabel>
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
                ? t("menu.uploadMoreImages")
                : t("menu.uploadImages")}
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
            {t("menu.imagesHint")}
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
              {t("menu.availableForOrder")}
            </FieldLabel>
          </div>
        </Field>
      )}

      </div>

      {/* Form Actions */}
      <div className="flex gap-3 border-t pt-4 pb-4 px-4 mt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? t("common.updating")
              : t("common.creating")
            : isEdit
            ? t("menu.updateItem")
            : t("menu.createItem")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
};
