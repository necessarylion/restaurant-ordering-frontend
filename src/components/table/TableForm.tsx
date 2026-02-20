/**
 * Table Form Component
 * Form for creating and editing tables with seats and zone fields
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tableSchema } from "@/lib/schemas";
import type { Table, Zone } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableFormProps {
  table?: Table;
  zones?: Zone[];
  onSubmit: (data: TableFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type TableFormData = {
  table_number: string;
  seats: number;
  zone_id?: number;
  is_active: boolean;
};

export const TableForm = ({
  table,
  zones = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TableFormProps) => {
  const isEdit = !!table;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema) as any,
    defaultValues: isEdit
      ? {
          table_number: table.table_number,
          seats: table.seats || 4,
          zone_id: table.zone_id ?? undefined,
          is_active: table.is_active,
        }
      : {
          table_number: "",
          seats: 4,
          zone_id: undefined,
          is_active: true,
        },
  });

  const isActive = watch("is_active");
  const zoneId = watch("zone_id");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Table Number */}
        <Field data-invalid={!!errors.table_number}>
          <FieldLabel>Table Number</FieldLabel>
          <FieldContent>
            <Input
              {...register("table_number")}
              placeholder="e.g., Table 1, A1, VIP-01"
            />
          </FieldContent>
          {errors.table_number && (
            <FieldError>{errors.table_number.message}</FieldError>
          )}
        </Field>

        {/* Seats */}
        <Field data-invalid={!!errors.seats}>
          <FieldLabel>Seats</FieldLabel>
          <FieldContent>
            <Input
              type="number"
              min={1}
              {...register("seats", { valueAsNumber: true })}
              placeholder="4"
            />
          </FieldContent>
          {errors.seats && <FieldError>{errors.seats.message}</FieldError>}
        </Field>
      </div>

      {/* Zone */}
      {zones.length > 0 && (
        <Field>
          <FieldLabel>Zone</FieldLabel>
          <FieldContent>
            <Select
              value={zoneId ? String(zoneId) : "none"}
              onValueChange={(val) =>
                setValue("zone_id", val === "none" ? undefined : Number(val))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No zone</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={String(zone.id)}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      )}

      {/* Active Status */}
      <Field>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", !!checked)}
          />
          <FieldLabel htmlFor="is_active" className="mb-0! cursor-pointer">
            Active (available for orders)
          </FieldLabel>
        </div>
      </Field>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Table"
            : "Create Table"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
