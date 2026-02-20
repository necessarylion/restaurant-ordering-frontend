/**
 * FloorPlanCanvas component
 * Interactive canvas for managing table positions using react-konva.
 * Positions are read from API (table.position_x/y) and saved on drag end.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import type Konva from "konva";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTables, useZones, useSaveFloorPlan, useUpdateTable } from "@/hooks/useTables";
import { useOrders } from "@/hooks/useOrders";
import { TableNode, type TableStatus } from "./TableNode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@hugeicons/core-free-icons";
import { OrderStatus } from "@/types/models";
import type { Table, Order } from "@/types";

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const SCALE_STEP = 0.15;

function getTableStatus(table: Table, orders: Order[]): TableStatus {
  if (!table.is_active) return "inactive";

  const activeStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
  ];

  const hasActiveOrder = orders.some(
    (o) => o.table_id === table.id && activeStatuses.includes(o.status)
  );

  return hasActiveOrder ? "occupied" : "available";
}

export const FloorPlanCanvas = () => {
  const { currentRestaurant } = useRestaurant();
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const { data: zones = [] } = useZones(currentRestaurant?.id);
  const { data: orders = [] } = useOrders(currentRestaurant?.id);
  const saveFloorPlanMutation = useSaveFloorPlan();
  const updateTableMutation = useUpdateTable();

  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [seatsInput, setSeatsInput] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

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

  // Mouse wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, oldScale + direction * SCALE_STEP)
    );

    setScale(newScale);
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
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

  // Stats for current view
  const stats = useMemo(() => {
    const result = { available: 0, occupied: 0, inactive: 0, totalSeats: 0 };
    filteredTables.forEach((table) => {
      const status = getTableStatus(table, orders);
      result[status]++;
      result.totalSeats += table.seats;
    });
    return result;
  }, [filteredTables, orders]);

  // Global stats
  const globalStats = useMemo(() => {
    let totalSeats = 0;
    tables.forEach((table) => {
      totalSeats += table.seats;
    });
    return { totalTables: tables.length, totalSeats };
  }, [tables]);

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
      setSelectedTableId((prev) => (prev === tableId ? null : tableId));
      const table = tables.find((t) => t.id === tableId);
      if (table) {
        setSeatsInput(String(table.seats));
        setSelectedZoneId(table.zone_id ? String(table.zone_id) : "none");
      }
    },
    [tables]
  );

  const handleSeatsSubmit = async () => {
    if (selectedTableId === null || !currentRestaurant) return;
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) return;
    const seats = parseInt(seatsInput, 10);
    if (isNaN(seats) || seats < 1) return;

    try {
      await updateTableMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
        table_number: table.table_number,
        is_active: table.is_active,
        seats,
        zone_id: table.zone_id ?? undefined,
        position_x: table.position_x,
        position_y: table.position_y,
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleZoneChange = async (zoneVal: string) => {
    if (selectedTableId === null || !currentRestaurant) return;
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) return;

    setSelectedZoneId(zoneVal);
    const zoneId = zoneVal === "none" ? undefined : Number(zoneVal);

    try {
      await updateTableMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
        table_number: table.table_number,
        is_active: table.is_active,
        seats: table.seats,
        zone_id: zoneId,
        position_x: table.position_x,
        position_y: table.position_y,
      });
    } catch {
      // error handled by mutation
    }
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const selectedTableStatus = selectedTable
    ? getTableStatus(selectedTable, orders)
    : null;

  const activeZone = zones.find((z) => z.id === activeZoneId);
  const zoomPercent = Math.round(scale * 100);

  return (
    <div className="flex gap-4">
      {/* Left: Zone color bar */}
      {zones.length > 0 && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveZoneId(null)}
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
                  onClick={() => setActiveZoneId(zone.id)}
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
          className="relative rounded-lg border bg-card overflow-hidden"
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
                height={stageSize.height}
                draggable
                onWheel={handleWheel}
              >
                <Layer>
                  {filteredTables.map((table) => {
                    const status = getTableStatus(table, orders);
                    return (
                      <TableNode
                        key={table.id}
                        id={table.id}
                        tableNumber={table.table_number}
                        x={table.position_x}
                        y={table.position_y}
                        seats={table.seats}
                        status={status}
                        isSelected={selectedTableId === table.id}
                        onDragEnd={handleDragEnd}
                        onClick={handleTableClick}
                      />
                    );
                  })}
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
          {/* Statistics */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Statistics</h3>
              {activeZone && (
                <div className="flex items-center gap-1.5">
                  {activeZone.color && (
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: activeZone.color }}
                    />
                  )}
                  <span className="text-xs text-muted-foreground">{activeZone.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-green-500" />
                  <span className="text-sm">Available</span>
                </div>
                <span className="text-sm font-medium">{stats.available}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm">Occupied</span>
                </div>
                <span className="text-sm font-medium">{stats.occupied}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-gray-400" />
                  <span className="text-sm">Inactive</span>
                </div>
                <span className="text-sm font-medium">{stats.inactive}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-1.5">
              {activeZone && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{activeZone.name} Seats</span>
                  <span className="font-medium">{stats.totalSeats}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Tables</span>
                <span className="font-medium">{globalStats.totalTables}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Seats</span>
                <span className="font-medium">{globalStats.totalSeats}</span>
              </div>
            </div>
          </div>

          {/* Selected Table Details */}
          {selectedTable ? (
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold">{selectedTable.table_number}</h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`size-2 rounded-full ${
                      selectedTableStatus === "available"
                        ? "bg-green-500"
                        : selectedTableStatus === "occupied"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs capitalize text-muted-foreground">
                    {selectedTableStatus}
                  </span>
                </div>
              </div>

              {/* Seats */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Seats</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={seatsInput}
                    onChange={(e) => setSeatsInput(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleSeatsSubmit}
                    disabled={updateTableMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Zone */}
              {zones.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Zone</label>
                  <Select value={selectedZoneId} onValueChange={handleZoneChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No zone</SelectItem>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={String(z.id)}>
                          <span className="flex items-center gap-2">
                            {z.color && (
                              <span
                                className="size-2 rounded-full shrink-0"
                                style={{ backgroundColor: z.color }}
                              />
                            )}
                            {z.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-4">
              <p className="text-center text-xs text-muted-foreground">
                Click a table to view details
              </p>
            </div>
          )}
        </div>
      </div>
  );
};
