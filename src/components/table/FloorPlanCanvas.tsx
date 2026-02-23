/**
 * FloorPlanCanvas component
 * Interactive canvas for managing table positions using react-konva.
 * Positions are read from API (table.position_x/y) and saved on drag end.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Stage, Layer } from "react-konva";
import type Konva from "konva";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTables, useTable, useZones, useSaveFloorPlan, useGenerateTableToken } from "@/hooks/useTables";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCreatePayment } from "@/hooks/usePayments";
import { BookingForm } from "@/components/booking/BookingForm";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderDetailDialog } from "@/components/order/OrderDetailDialog";
import { TableQRCode } from "./TableQRCode";
import { TableNode } from "./TableNode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  SearchAreaIcon,
  ShoppingBasket03Icon,
  Calendar03Icon,
  DollarCircleIcon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import type { Order } from "@/types";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import type { CreateBookingFormData } from "@/schemas/booking_schema";
import { toRFC3339 } from "@/lib/utils";

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const SCALE_STEP = 0.15;

interface FloorPlanCanvasProps {
  activeZoneId: number | null;
  onActiveZoneChange: (zoneId: number | null) => void;
}

export const FloorPlanCanvas = ({ activeZoneId, onActiveZoneChange }: FloorPlanCanvasProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentRestaurant } = useRestaurant();
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const { data: zones = [] } = useZones(currentRestaurant?.id);
  const saveFloorPlanMutation = useSaveFloorPlan();
  const createBookingMutation = useCreateBooking();
  const createPaymentMutation = useCreatePayment();
  const queryClient = useQueryClient();

  const selectedTableId = searchParams.get("tableId") ? Number(searchParams.get("tableId")) : null;
  const setSelectedTableId = useCallback((id: number | null) => {
    setSearchParams((prev) => {
      if (id) {
        prev.set("tableId", String(id));
      } else {
        prev.delete("tableId");
      }
      return prev;
    }, { replace: true });
  }, [setSearchParams]);
  const { data: tableDetails, refetch: refetchTableDetails } = useTable(currentRestaurant?.id, selectedTableId ?? undefined);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const generateTokenMutation = useGenerateTableToken();
  const [qrCodeData, setQrCodeData] = useState<{
    token: string;
    expiresAt: string;
  } | null>(null);
  const { alert: showAlert, confirm } = useAlertDialog();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 700, height: 600 });

  // Responsive stage sizing
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.max(500, window.innerHeight - 240);
        setStageSize({ width, height });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleZoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const newScale = Math.min(MAX_SCALE, scale + SCALE_STEP);
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, [scale, stageSize]);

  const handleZoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const newScale = Math.max(MIN_SCALE, scale - SCALE_STEP);
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  }, [scale, stageSize]);

  const handleResetZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    setScale(1);
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
  }, []);

  // Filter tables by active zone
  const filteredTables = useMemo(() => {
    if (activeZoneId === null) return tables;
    return tables.filter((table) => table.zone_id === activeZoneId);
  }, [tables, activeZoneId]);

  // Save position to API immediately on drag end
  const handleDragEnd = useCallback(
    (tableId: number, x: number, y: number) => {
      if (!currentRestaurant) return;
      saveFloorPlanMutation.mutate({
        restaurantId: currentRestaurant.id,
        data: { tables: [{ id: tableId, x, y }] },
      });
    },
    [currentRestaurant, saveFloorPlanMutation]
  );

  const handleTableClick = useCallback(
    (tableId: number) => {
      if (selectedTableId === tableId) {
        refetchTableDetails();
      } else {
        setSelectedTableId(tableId);
      }
    },
    [selectedTableId, refetchTableDetails]
  );

  const handleGenerateQR = useCallback(async () => {
    if (!currentRestaurant || !selectedTableId) return;
    try {
      const result = await generateTokenMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: selectedTableId,
      });
      setQrCodeData({ token: result.token, expiresAt: result.expires_at });
    } catch (err: any) {
      showAlert({ title: "Error", description: err.message || "Failed to generate QR code" });
    }
  }, [currentRestaurant, selectedTableId, generateTokenMutation, showAlert]);

  const handleMakePayment = useCallback(async () => {
    if (!currentRestaurant || !selectedTableId || !tableDetails?.active_orders?.length) return;
    const orders = tableDetails.active_orders;

    const confirmed = await confirm({
      title: "Make Payment",
      description: `Confirm payment for ${orders.length} order(s) on this table?`,
      confirmLabel: "Confirm",
    });
    if (!confirmed) return;

    try {
      await createPaymentMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        table_id: selectedTableId,
      });
      queryClient.invalidateQueries({
        queryKey: ["tables", currentRestaurant.id, selectedTableId],
      });
    } catch (err: any) {
      showAlert({ title: "Error", description: err.message || "Failed to make payment" });
    }
  }, [currentRestaurant, selectedTableId, tableDetails, confirm, createPaymentMutation, queryClient, showAlert]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const activeZone = zones.find((z) => z.id === activeZoneId);
  const zoomPercent = Math.round(scale * 100);

  return (
    <div className="flex gap-4">
      {/* Left: Zone color bar */}
      {zones.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onActiveZoneChange(null)}
                className={`size-5 rounded-full transition-transform ${
                  activeZoneId === null
                    ? "scale-110 ring-1 ring-primary ring-offset-1 ring-offset-background"
                    : "hover:scale-110"
                }`}
                style={{
                  background:
                    "conic-gradient(#22c55e 0% 33%, #eab308 33% 66%, #ef4444 66% 100%)",
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="right">All Zones</TooltipContent>
          </Tooltip>
          {zones.map((zone) => (
            <Tooltip key={zone.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onActiveZoneChange(zone.id)}
                  className={`size-5 rounded-full transition-transform ${
                    activeZoneId === zone.id
                      ? "scale-110 ring-1 ring-offset-1 ring-offset-background"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: zone.color || "#6b7280",
                    borderColor: "transparent",
                    ...(activeZoneId === zone.id ? { "--tw-ring-color": zone.color || "#6b7280" } as React.CSSProperties : {}),
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right">{zone.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 space-y-0">
        <div
          ref={containerRef}
          className="relative rounded-lg border bg-card"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
            {filteredTables.length === 0 ? (
              <div
                className="flex items-center justify-center"
                style={{ height: stageSize.height }}
              >
                <p className="text-muted-foreground">
                  {tables.length === 0
                    ? "No tables yet. Create tables first to use the floor plan."
                    : `No tables in "${activeZone?.name ?? "this"}" zone.`}
                </p>
              </div>
            ) : (
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height + 80}
                draggable
              >
                <Layer>
                  {filteredTables.map((table) => (
                      <TableNode
                        key={table.id}
                        id={table.id}
                        tableNumber={table.table_number}
                        x={table.position_x}
                        y={table.position_y}
                        seats={table.seats}
                        status={table.status}
                        isSelected={selectedTableId === table.id}
                        onDragEnd={handleDragEnd}
                        onClick={handleTableClick}
                      />
                    ))}
                </Layer>
              </Stage>
            )}

            {/* Zoom controls overlay */}
            {filteredTables.length > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md border bg-card/90 p-1 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleZoomOut}
                  disabled={scale <= MIN_SCALE}
                >
                  <HugeiconsIcon icon={ZoomOutAreaIcon} strokeWidth={2} className="size-4" />
                </Button>
                <button
                  onClick={handleResetZoom}
                  className="min-w-10 text-center text-xs tabular-nums text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {zoomPercent}%
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleZoomIn}
                  disabled={scale >= MAX_SCALE}
                >
                  <HugeiconsIcon icon={ZoomInAreaIcon} strokeWidth={2} className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleResetZoom}
                  title="Reset view"
                >
                  <HugeiconsIcon icon={SearchAreaIcon} strokeWidth={2} className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Selected Table Details */}
          {selectedTable ? (
            <>
              <div className="rounded-lg border bg-card p-4 space-y-4">
                <h3 className="text-sm font-semibold mb-1">{selectedTable.table_number}</h3>

                {/* Actions */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Actions</label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleGenerateQR}
                    disabled={generateTokenMutation.isPending}
                  >
                    <HugeiconsIcon icon={QrCodeIcon} strokeWidth={2} className="size-4" />
                    {generateTokenMutation.isPending ? "Generating..." : "Generate QR Code"}
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/dashboard/orders/create?tableId=${selectedTable.id}`)}
                  >
                    <HugeiconsIcon icon={ShoppingBasket03Icon} strokeWidth={2} className="size-4" />
                    Create Order
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-purple-700 text-white hover:bg-purple-800"
                    onClick={() => setShowBookingModal(true)}
                  >
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                    Create Booking
                  </Button>
                  {tableDetails?.active_orders && tableDetails.active_orders.length > 0 && (
                    <Button
                      size="sm"
                      className="w-full bg-amber-600 text-white hover:bg-amber-700"
                      onClick={handleMakePayment}
                      disabled={createPaymentMutation.isPending}
                    >
                      <HugeiconsIcon icon={DollarCircleIcon} strokeWidth={2} className="size-4" />
                      {createPaymentMutation.isPending ? "Processing..." : "Make Payment"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Bookings */}
              {tableDetails?.active_bookings && tableDetails.active_bookings.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground ml-1">
                    Bookings ({tableDetails.active_bookings.length})
                  </label>
                  <div className="space-y-2">
                    {tableDetails.active_bookings.map((booking) => (
                      <div key={booking.id} className="rounded-lg border bg-card p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{booking.customer_name}</span>
                          <span className="text-[10px] capitalize rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5">
                            {booking.status}
                          </span>
                        </div>
                        {booking.phone && (
                          <p className="text-xs text-muted-foreground">{booking.phone}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.booking_date_time).toLocaleString()}
                        </p>
                        {booking.notes && (
                          <p className="text-xs text-muted-foreground italic">{booking.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Orders */}
              {tableDetails?.active_orders && tableDetails.active_orders.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground ml-1">
                    Active Orders ({tableDetails.active_orders.length})
                  </label>
                  <div className="space-y-2">
                    {tableDetails.active_orders.map((order: Order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={(o) => setSelectedOrder(o)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-4">
              <p className="text-center text-xs text-muted-foreground">
                Click a table to view details
              </p>
            </div>
          )}
        </div>

        {/* Create Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Create Booking — {selectedTable?.table_number}
              </DialogTitle>
            </DialogHeader>
            <BookingForm
              tables={tables}
              defaultTableId={selectedTable ? String(selectedTable.id) : undefined}
              onSubmit={async (data) => {
                if (!currentRestaurant) return;
                const formData = data as CreateBookingFormData;
                try {
                  await createBookingMutation.mutateAsync({
                    restaurantId: currentRestaurant.id,
                    table_id: Number(formData.table_id),
                    customer_name: formData.customer_name,
                    booking_date_time: toRFC3339(formData.booking_date_time),
                    phone: formData.phone || undefined,
                    notes: formData.notes || undefined,
                  });
                  setShowBookingModal(false);
                  queryClient.invalidateQueries({
                    queryKey: ["tables", currentRestaurant.id],
                  });
                } catch (err: any) {
                  showAlert({ title: "Error", description: err.message || "Failed to create booking" });
                }
              }}
              onCancel={() => setShowBookingModal(false)}
              isSubmitting={createBookingMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={() => {
            if (currentRestaurant && selectedTableId) {
              queryClient.invalidateQueries({
                queryKey: ["tables", currentRestaurant.id, selectedTableId],
              });
            }
          }}
        />

        {/* QR Code Dialog */}
        <Dialog open={!!qrCodeData} onOpenChange={(open) => !open && setQrCodeData(null)}>
          <DialogContent className="sm:max-w-md">
            {qrCodeData && currentRestaurant && selectedTable && (
              <TableQRCode
                tableName={selectedTable.table_number}
                restaurantId={currentRestaurant.id}
                token={qrCodeData.token}
                expiresAt={qrCodeData.expiresAt}
                onClose={() => setQrCodeData(null)}
              />
            )}
          </DialogContent>
        </Dialog>

      </div>
  );
};
