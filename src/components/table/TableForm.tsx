/**
 * Table Form Component
 * Form for creating and editing tables
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tableSchema } from "@/lib/schemas";
import type { Table } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface TableFormProps {
  table?: Table; // If provided, we're editing
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type TableFormData = {
  table_number: string;
  is_active: boolean;
};

export const TableForm = ({
  table,
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
          is_active: table.is_active,
        }
      : {
          table_number: "",
          is_active: true,
        },
  });

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
