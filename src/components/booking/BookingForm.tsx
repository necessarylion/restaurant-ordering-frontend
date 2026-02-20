/**
 * Booking Form Component
 * Form for creating and editing bookings
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBookingFormSchema,
  updateBookingFormSchema,
  type CreateBookingFormData,
  type UpdateBookingFormData,
} from "@/lib/schemas";
import { toDatetimeLocal } from "@/lib/utils";
import { BookingStatus, type Booking, type Table } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingFormProps {
  booking?: Booking;
  tables: Table[];
  defaultTableId?: string;
  onSubmit: (data: CreateBookingFormData | UpdateBookingFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const bookingStatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.COMPLETED]: "Completed",
  [BookingStatus.NO_SHOW]: "No Show",
};

export const BookingForm = ({
  booking,
  tables,
  defaultTableId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BookingFormProps) => {
  const isEdit = !!booking;
  const schema = isEdit ? updateBookingFormSchema : createBookingFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBookingFormData | UpdateBookingFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit
      ? {
          table_id: String(booking.table_id),
          customer_name: booking.customer_name,
          booking_date_time: toDatetimeLocal(booking.booking_date_time),
          phone: booking.phone || "",
          notes: booking.notes || "",
          status: booking.status,
        }
      : {
          table_id: defaultTableId || "",
          customer_name: "",
          booking_date_time: "",
          phone: "",
          notes: "",
        },
  });

  const tableId = watch("table_id");
  const status = isEdit ? watch("status" as any) : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Customer Name */}
        <Field data-invalid={!!errors.customer_name}>
          <FieldLabel>Customer Name</FieldLabel>
          <FieldContent>
            <Input
              {...register("customer_name")}
              placeholder="e.g., John Doe"
            />
          </FieldContent>
          {errors.customer_name && (
            <FieldError>{errors.customer_name.message}</FieldError>
          )}
        </Field>

        {/* Phone */}
        <Field data-invalid={!!errors.phone}>
          <FieldLabel>Phone</FieldLabel>
          <FieldContent>
            <Input
              {...register("phone")}
              placeholder="e.g., 09123456789"
            />
          </FieldContent>
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Table */}
        <Field data-invalid={!!errors.table_id}>
          <FieldLabel>Table</FieldLabel>
          <FieldContent>
            <Select
              value={tableId || ""}
              onValueChange={(val) => setValue("table_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {table.table_number} ({table.seats} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          {errors.table_id && (
            <FieldError>{errors.table_id.message}</FieldError>
          )}
        </Field>

        {/* Booking Date/Time */}
        <Field data-invalid={!!errors.booking_date_time}>
          <FieldLabel>Date & Time</FieldLabel>
          <FieldContent>
            <Input
              type="datetime-local"
              {...register("booking_date_time")}
            />
          </FieldContent>
          {errors.booking_date_time && (
            <FieldError>{errors.booking_date_time.message}</FieldError>
          )}
        </Field>
      </div>

      {/* Status (edit only) */}
      {isEdit && (
        <Field data-invalid={!!(errors as any).status}>
          <FieldLabel>Status</FieldLabel>
          <FieldContent>
            <Select
              value={status || ""}
              onValueChange={(val) => setValue("status" as any, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BookingStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {bookingStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          {(errors as any).status && (
            <FieldError>{(errors as any).status.message}</FieldError>
          )}
        </Field>
      )}

      {/* Notes */}
      <Field data-invalid={!!errors.notes}>
        <FieldLabel>Notes</FieldLabel>
        <FieldContent>
          <Textarea
            {...register("notes")}
            placeholder="e.g., Window seat preferred"
            rows={3}
          />
        </FieldContent>
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Booking"
            : "Create Booking"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
