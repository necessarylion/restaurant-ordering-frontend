/**
 * Booking Form Component
 * Form for creating and editing bookings
 */

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBookingFormSchema,
  updateBookingFormSchema,
  type CreateBookingFormData,
  type UpdateBookingFormData,
} from "@/schemas/booking_schema";
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
  [BookingStatus.PENDING]: "booking.pending",
  [BookingStatus.CONFIRMED]: "booking.confirmed",
  [BookingStatus.CANCELLED]: "booking.cancelled",
  [BookingStatus.COMPLETED]: "booking.completed",
  [BookingStatus.NO_SHOW]: "booking.noShow",
};

export const BookingForm = ({
  booking,
  tables,
  defaultTableId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BookingFormProps) => {
  const { t } = useTranslation();
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
          <FieldLabel>{t("booking.customerName")}</FieldLabel>
          <FieldContent>
            <Input
              {...register("customer_name")}
              placeholder={t("booking.customerNamePlaceholder")}
            />
          </FieldContent>
          {errors.customer_name && (
            <FieldError>{errors.customer_name.message}</FieldError>
          )}
        </Field>

        {/* Phone */}
        <Field data-invalid={!!errors.phone}>
          <FieldLabel>{t("common.phone")}</FieldLabel>
          <FieldContent>
            <Input
              {...register("phone")}
              placeholder={t("booking.phonePlaceholder")}
            />
          </FieldContent>
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Table */}
        <Field data-invalid={!!errors.table_id}>
          <FieldLabel>{t("booking.table")}</FieldLabel>
          <FieldContent>
            <Select
              value={tableId || ""}
              onValueChange={(val) => setValue("table_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectTable")} />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {t("booking.tableSeats", { table: table.table_number, seats: table.seats })}
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
          <FieldLabel>{t("booking.dateTime")}</FieldLabel>
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
          <FieldLabel>{t("booking.status")}</FieldLabel>
          <FieldContent>
            <Select
              value={status || ""}
              onValueChange={(val) => setValue("status" as any, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BookingStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(bookingStatusLabels[s])}
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
        <FieldLabel>{t("common.notes")}</FieldLabel>
        <FieldContent>
          <Textarea
            {...register("notes")}
            placeholder={t("booking.notesPlaceholder")}
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
              ? t("common.updating")
              : t("common.creating")
            : isEdit
            ? t("booking.updateBooking")
            : t("booking.createBooking")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
};
