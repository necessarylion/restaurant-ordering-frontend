/**
 * Booking List Page
 * Display and manage bookings for a restaurant
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  PencilEdit01Icon,
  Delete01Icon,
  TableRoundIcon,
  CallIcon,
  StickyNote01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { BookingStatus, type Booking } from "@/types";
import type {
  CreateBookingFormData,
  UpdateBookingFormData,
} from "@/schemas/booking_schema";
import { toRFC3339 } from "@/lib/utils";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [BookingStatus.CONFIRMED]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [BookingStatus.CANCELLED]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  [BookingStatus.COMPLETED]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [BookingStatus.NO_SHOW]: "bg-muted text-muted-foreground",
};

const statusIcons: Record<BookingStatus, any> = {
  [BookingStatus.PENDING]: Clock04Icon,
  [BookingStatus.CONFIRMED]: CheckmarkCircle02Icon,
  [BookingStatus.CANCELLED]: Cancel01Icon,
  [BookingStatus.COMPLETED]: TaskDone02Icon,
  [BookingStatus.NO_SHOW]: UserRemove02Icon,
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

  const { confirm, alert: showAlert } = useAlertDialog();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [defaultTableId, setDefaultTableId] = useState<string | undefined>(undefined);

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
      await showAlert({ title: "Error", description: error.message || "Failed to create booking" });
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
      await showAlert({ title: "Error", description: error.message || "Failed to update booking" });
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: "Delete Booking?",
      description: `Are you sure you want to delete the booking for "${booking.customer_name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        bookingId: booking.id,
      });
    } catch (error: any) {
      await showAlert({ title: "Error", description: error.message || "Failed to delete booking" });
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
      <ErrorCard
        title="Error Loading Bookings"
        message={(error as any).message || "Failed to load bookings"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description={`Manage reservations for ${currentRestaurant.name}`}>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingBooking(null);
          }}
        >
          Create Booking
        </Button>
      </PageHeader>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => { if (!open) { setShowCreateForm(false); setDefaultTableId(undefined); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <BookingForm
              booking={editingBooking}
              tables={tables}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBooking(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

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
              No bookings found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 shrink-0" />
                    {booking.customer_name}
                  </CardTitle>
                  <Badge className={statusStyles[booking.status]}>
                    <HugeiconsIcon icon={statusIcons[booking.status]} strokeWidth={2} className="size-3.5" />
                    {statusLabels[booking.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4 shrink-0" />
                    <span>{booking.table?.table_number || `Table #${booking.table_id}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4 shrink-0" />
                    <span>{formatDateTime(booking.booking_date_time)}</span>
                  </div>
                  {booking.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4 shrink-0" />
                      <a href={`tel:${booking.phone}`} className="hover:underline">{booking.phone}</a>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={StickyNote01Icon} strokeWidth={2} className="size-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{booking.notes || "—"}</span>
                  </div>
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
                    <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(booking)}
                  >
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
