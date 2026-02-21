/**
 * Restaurant Form Component
 * Create/Edit restaurant form with validation
 */

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema, type RestaurantFormData } from "@/schemas/restaurant_schema";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Restaurant } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageUpload01Icon } from "@hugeicons/core-free-icons";

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  restaurant,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          address: restaurant.address || "",
          phone: restaurant.phone || "",
          currency: restaurant.currency || "",
        }
      : undefined,
  });

  const logoFiles = watch("logo");
  const previewUrl = logoFiles instanceof FileList && logoFiles.length > 0
    ? URL.createObjectURL(logoFiles[0])
    : restaurant?.logo || null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel>Logo</FieldLabel>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50 hover:bg-muted transition-colors overflow-hidden cursor-pointer"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo preview"
                className="size-full object-cover"
              />
            ) : (
              <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.5} className="size-8 text-muted-foreground" />
            )}
          </button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            {...register("logo")}
            ref={(e) => {
              register("logo").ref(e);
              (fileInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
            }}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP. Max 5MB.
          </p>
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="name">Restaurant Name *</FieldLabel>
        <Input
          id="name"
          placeholder="My Restaurant"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <Input
          id="address"
          placeholder="123 Main St"
          {...register("address")}
          disabled={isSubmitting}
        />
        {errors.address && <FieldError>{errors.address.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <Input
          id="phone"
          type="tel"
          placeholder="09123456789"
          {...register("phone")}
          disabled={isSubmitting}
        />
        {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="currency">Currency</FieldLabel>
        <Input
          id="currency"
          placeholder="USD"
          {...register("currency")}
          disabled={isSubmitting}
        />
        {errors.currency && <FieldError>{errors.currency.message}</FieldError>}
      </Field>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : restaurant
            ? "Update Restaurant"
            : "Create Restaurant"}
        </Button>
      </div>
    </form>
  );
};
