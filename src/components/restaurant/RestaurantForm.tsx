/**
 * Restaurant Form Component
 * Create/Edit restaurant form with validation
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema, type RestaurantFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Restaurant } from "@/types";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          address: restaurant.address || "",
          phone: restaurant.phone || "",
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
