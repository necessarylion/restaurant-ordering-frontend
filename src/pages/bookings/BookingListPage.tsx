/**
 * Booking List Page
 * Display and manage bookings for a restaurant
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  [BookingStatus.PENDING]: "booking.pending",
  [BookingStatus.CONFIRMED]: "booking.confirmed",
  [BookingStatus.CANCELLED]: "booking.cancelled",
  [BookingStatus.COMPLETED]: "booking.completed",
  [BookingStatus.NO_SHOW]: "booking.noShow",
};

export const BookingListPage = () => {
  const { t } = useTranslation();
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
      await showAlert({ title: t("common.error"), description: error.message || t("booking.failedToCreate") });
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
      await showAlert({ title: t("common.error"), description: error.message || t("booking.failedToUpdate") });
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: t("booking.deleteBooking"),
      description: t("booking.deleteConfirm", { name: booking.customer_name }),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        bookingId: booking.id,
      });
    } catch (error: any) {
      await showAlert({ title: t("common.error"), description: error.message || t("booking.failedToDelete") });
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
            <CardTitle>{t("common.noRestaurantSelected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("booking.selectRestaurant")}
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
        title={t("booking.errorLoading")}
        message={(error as any).message || t("booking.failedToLoad")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("booking.title")} description={t("booking.description", { name: currentRestaurant.name })}>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingBooking(null);
          }}
        >
          {t("booking.createBooking")}
        </Button>
      </PageHeader>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => { if (!open) { setShowCreateForm(false); setDefaultTableId(undefined); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("booking.createNewBooking")}</DialogTitle>
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
            <DialogTitle>{t("booking.editBooking")}</DialogTitle>
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
            {t("common.today")}
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.PENDING}>
            <HugeiconsIcon icon={Clock04Icon} strokeWidth={2} className="size-4" />
            {t("booking.pending")}
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CONFIRMED}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
            {t("booking.confirmed")}
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.CANCELLED}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
            {t("booking.cancelled")}
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.COMPLETED}>
            <HugeiconsIcon icon={TaskDone02Icon} strokeWidth={2} className="size-4" />
            {t("booking.completed")}
          </TabsTrigger>
          <TabsTrigger value={BookingStatus.NO_SHOW}>
            <HugeiconsIcon icon={UserRemove02Icon} strokeWidth={2} className="size-4" />
            {t("booking.noShow")}
          </TabsTrigger>
          <TabsTrigger value="all">
            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
            {t("common.all")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("booking.noBookingsFound")}
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
                    {t(statusLabels[booking.status])}
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
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(booking)}
                  >
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-1" />
                    {t("common.delete")}
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
