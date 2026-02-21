/**
 * Booking List Page
 * Display and manage bookings for a restaurant
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTables } from "@/hooks/useTables";
import {
  useBookings,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
} from "@/hooks/useBookings";
import { BookingForm } from "@/components/booking/BookingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridViewIcon,
  Clock04Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  TaskDone02Icon,
  UserRemove02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookingStatus, type Booking } from "@/types";
import type {
  CreateBookingFormData,
  UpdateBookingFormData,
} from "@/schemas/booking_schema";
import { toRFC3339 } from "@/lib/utils";

const statusVariants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [BookingStatus.PENDING]: "secondary",
  [BookingStatus.CONFIRMED]: "default",
  [BookingStatus.CANCELLED]: "destructive",
  [BookingStatus.COMPLETED]: "outline",
  [BookingStatus.NO_SHOW]: "destructive",
};

const statusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.COMPLETED]: "Completed",
  [BookingStatus.NO_SHOW]: "No Show",
};

export const BookingListPage = () => {
  const { currentRestaurant } = useRestaurant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("today");

  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const {
    data: bookings = [],
    isLoading,
    error,
  } = useBookings(currentRestaurant?.id, {
    status: statusFilter !== "all" && statusFilter !== "today" ? statusFilter : undefined,
    date_from: statusFilter === "today" ? todayDate : undefined,
    date_to: statusFilter === "today" ? todayDate : undefined,
  });
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();
  const deleteMutation = useDeleteBooking();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [defaultTableId, setDefaultTableId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-open create form when tableId query param is present
  useEffect(() => {
    const tableId = searchParams.get("tableId");
    if (tableId) {
      setDefaultTableId(tableId);
      setShowCreateForm(true);
      setEditingBooking(null);
      // Clean up query param
      searchParams.delete("tableId");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreate = async (data: CreateBookingFormData | UpdateBookingFormData) => {
    if (!currentRestaurant) return;
    const formData = data as CreateBookingFormData;

    try {
      await createMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        table_id: Number(formData.table_id),
        customer_name: formData.customer_name,
        booking_date_time: toRFC3339(formData.booking_date_time),
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
      });
      setShowCreateForm(false);
      setDefaultTableId(undefined);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create booking");
    }
  };

  const handleUpdate = async (data: CreateBookingFormData | UpdateBookingFormData) => {
    if (!currentRestaurant || !editingBooking) return;
    const formData = data as UpdateBookingFormData;

    try {
      await updateMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        bookingId: editingBooking.id,
        table_id: Number(formData.table_id),
        customer_name: formData.customer_name,
        booking_date_time: toRFC3339(formData.booking_date_time),
        status: formData.status,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
      });
      setEditingBooking(null);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update booking");
    }
  };

  const handleDelete = async () => {
    if (!currentRestaurant || !bookingToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        bookingId: bookingToDelete.id,
      });
      setBookingToDelete(null);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to delete booking");
    }
  };

  const formatDateTime = (dateStr: string) => {
    // Ensure timezone info is present (assume UTC if missing)
    let normalized = dateStr;
    if (!/Z$/.test(dateStr) && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
      normalized = dateStr + "Z";
    }
    const date = new Date(normalized);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentRestaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Restaurant Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please select a restaurant to manage bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {(error as any).message || "Failed to load bookings"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage reservations for {currentRestaurant.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingBooking(null);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Booking"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingForm
              tables={tables}
              defaultTableId={defaultTableId}
              onSubmit={handleCreate}
              onCancel={() => {
                setShowCreateForm(false);
                setDefaultTableId(undefined);
              }}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingBooking && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingForm
              booking={editingBooking}
              tables={tables}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBooking(null)}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Status Filter */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="gap-2">
          <TabsTrigger value="today">
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
            Today
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.PENDING}>
            <HugeiconsIcon icon={Clock04Icon} strokeWidth={2} className="size-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CONFIRMED}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
            Confirmed
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CANCELLED}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
            Cancelled
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.COMPLETED}>
            <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} className="size-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.NO_SHOW}>
            <HugeiconsIcon icon={UserRemove02Icon} strokeWidth={2} className="size-4" />
            No Show
          </TabsTrigger>
          <TabsTrigger value="all">
            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No bookings found. Create your first booking to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {booking.customer_name}
                  </CardTitle>
                  <Badge variant={statusVariants[booking.status]}>
                    {statusLabels[booking.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Table:</span>{" "}
                    {booking.table?.table_number || `#${booking.table_id}`}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Date:</span>{" "}
                    {formatDateTime(booking.booking_date_time)}
                  </p>
                  {booking.phone && (
                    <p>
                      <span className="font-medium text-foreground">Phone:</span>{" "}
                      {booking.phone}
                    </p>
                  )}
                  {booking.notes && (
                    <p>
                      <span className="font-medium text-foreground">Notes:</span>{" "}
                      {booking.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBooking(booking);
                      setShowCreateForm(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setBookingToDelete(booking)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!bookingToDelete}
        onOpenChange={(open) => !open && setBookingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the booking for "
              {bookingToDelete?.customer_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog
        open={!!errorMessage}
        onOpenChange={(open) => !open && setErrorMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorMessage(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
