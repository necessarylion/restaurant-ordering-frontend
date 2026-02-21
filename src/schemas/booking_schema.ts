import { z } from "zod";
import { BookingStatus } from "@/types/models";

export const createBookingFormSchema = z.object({
  table_id: z.string().min(1, "Table is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  booking_date_time: z.string().min(1, "Booking date/time is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBookingFormSchema = createBookingFormSchema.extend({
  status: z.enum(BookingStatus),
});

export type CreateBookingFormData = z.infer<typeof createBookingFormSchema>;
export type UpdateBookingFormData = z.infer<typeof updateBookingFormSchema>;
