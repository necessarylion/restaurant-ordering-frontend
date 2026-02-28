/**
 * Restaurant Form Component
 * Create/Edit restaurant form with validation
 */

import { useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          booking_window_start_hours: restaurant.booking_window_start_hours ?? 0,
          booking_window_end_hours: restaurant.booking_window_end_hours ?? 2,
          tax_percent: restaurant.tax_percent ?? 0,
        }
      : {
          booking_window_start_hours: 0,
          booking_window_end_hours: 2,
          tax_percent: 0,
        },
  });

  const logoFiles = watch("logo");
  const endHours = watch("booking_window_end_hours") ?? 2;
  const previewUrl = logoFiles instanceof FileList && logoFiles.length > 0
    ? URL.createObjectURL(logoFiles[0])
    : restaurant?.logo || null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel>{t("restaurant.logo")}</FieldLabel>
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
            {t("restaurant.logoHint")}
          </p>
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="name">{t("restaurant.restaurantName")}</FieldLabel>
        <Input
          id="name"
          placeholder={t("restaurant.restaurantNamePlaceholder")}
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="address">{t("restaurant.address")}</FieldLabel>
        <Input
          id="address"
          placeholder={t("restaurant.addressPlaceholder")}
          {...register("address")}
          disabled={isSubmitting}
        />
        {errors.address && <FieldError>{errors.address.message}</FieldError>}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="phone">{t("common.phone")}</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder={t("restaurant.phonePlaceholder")}
            {...register("phone")}
            disabled={isSubmitting}
          />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="currency">{t("restaurant.currency")}</FieldLabel>
          <Input
            id="currency"
            placeholder={t("restaurant.currencyPlaceholder")}
            {...register("currency")}
            disabled={isSubmitting}
          />
          {errors.currency && <FieldError>{errors.currency.message}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="tax_percent">{t("restaurant.taxPercent")}</FieldLabel>
          <Input
            id="tax_percent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            placeholder="0"
            {...register("tax_percent", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.tax_percent && <FieldError>{errors.tax_percent.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="booking_window_end_hours">{t("restaurant.bookingDuration")}</FieldLabel>
          <Input
            id="booking_window_end_hours"
            type="number"
            min={0}
            placeholder="2"
            {...register("booking_window_end_hours", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">{t("restaurant.bookingDurationHint", { count: endHours })}</p>
          {errors.booking_window_end_hours && <FieldError>{errors.booking_window_end_hours.message}</FieldError>}
        </Field>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("common.saving")
            : restaurant
            ? t("restaurant.updateRestaurant")
            : t("restaurant.createRestaurant")}
        </Button>
      </div>
    </form>
  );
};
