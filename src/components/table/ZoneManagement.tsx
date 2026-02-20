/**
 * ZoneManagement component
 * Manage floor plan zones via API and assign tables to zones
 */

import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import {
  useTables,
  useZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useUpdateTable,
} from "@/hooks/useTables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Zone } from "@/types";

export const ZoneManagement = () => {
  const { currentRestaurant } = useRestaurant();
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const { data: zones = [] } = useZones(currentRestaurant?.id);
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();
  const updateTableMutation = useUpdateTable();

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneColor, setNewZoneColor] = useState("#6366f1");
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editZoneName, setEditZoneName] = useState("");
  const [editZoneColor, setEditZoneColor] = useState("");
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  const handleAddZone = async () => {
    const name = newZoneName.trim();
    if (!name || !currentRestaurant) return;

    try {
      await createZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        name,
        color: newZoneColor,
      });
      setNewZoneName("");
    } catch {
      // error handled by mutation
    }
  };

  const startEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setEditZoneName(zone.name);
    setEditZoneColor(zone.color || "#6366f1");
  };

  const handleUpdateZone = async () => {
    if (!editingZone || !currentRestaurant) return;
    const name = editZoneName.trim();
    if (!name) return;

    try {
      await updateZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        zoneId: editingZone.id,
        name,
        color: editZoneColor,
      });
      setEditingZone(null);
    } catch {
      // error handled by mutation
    }
  };

  const handleDeleteZone = async () => {
    if (!zoneToDelete || !currentRestaurant) return;

    try {
      await deleteZoneMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        zoneId: zoneToDelete.id,
      });
      setZoneToDelete(null);
    } catch {
      // error handled by mutation
    }
  };

  const handleTableZoneChange = async (
    tableId: number,
    newZoneId: string
  ) => {
    if (!currentRestaurant) return;
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    try {
      await updateTableMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
        table_number: table.table_number,
        is_active: table.is_active,
        seats: table.seats,
        zone_id: newZoneId === "none" ? undefined : Number(newZoneId),
        position_x: table.position_x,
        position_y: table.position_y,
      });
    } catch {
      // error handled by mutation
    }
  };

  // Group tables by zone
  const tablesByZone = zones.map((zone) => {
    const zoneTables = tables.filter((table) => table.zone_id === zone.id);
    const totalSeats = zoneTables.reduce((sum, table) => sum + table.seats, 0);
    return { zone, tables: zoneTables, totalSeats };
  });

  // Unassigned tables (no zone_id)
  const unassignedTables = tables.filter((table) => !table.zone_id);

  return (
    <div className="space-y-6">
      {/* Add zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g. Main Dining Room, Outdoor Patio, Bar Area"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddZone()}
            />
            <Input
              type="color"
              value={newZoneColor}
              onChange={(e) => setNewZoneColor(e.target.value)}
              className="w-12 p-1 h-10"
            />
            <Button
              onClick={handleAddZone}
              disabled={!newZoneName.trim() || createZoneMutation.isPending}
            >
              {createZoneMutation.isPending ? "Adding..." : "Add Zone"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone list */}
      <div className="space-y-4">
        {tablesByZone.map(({ zone, tables: zoneTables, totalSeats }) => (
          <Card key={zone.id}>
            <CardHeader>
              {editingZone?.id === zone.id ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={editZoneName}
                    onChange={(e) => setEditZoneName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateZone()}
                    className="h-8 flex-1"
                  />
                  <Input
                    type="color"
                    value={editZoneColor}
                    onChange={(e) => setEditZoneColor(e.target.value)}
                    className="w-10 p-1 h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateZone}
                    disabled={!editZoneName.trim() || updateZoneMutation.isPending}
                  >
                    {updateZoneMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingZone(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {zone.color && (
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: zone.color }}
                      />
                    )}
                    <CardTitle className="text-base">{zone.name}</CardTitle>
                    <Badge variant="secondary">
                      {zoneTables.length} tables
                    </Badge>
                    <Badge variant="outline">
                      {totalSeats} seats
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditZone(zone)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setZoneToDelete(zone)}
                      disabled={deleteZoneMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {zoneTables.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tables assigned to this zone.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {zoneTables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-1.5"
                    >
                      <span className="text-sm font-medium">
                        {table.table_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {table.seats} seats
                      </span>
                      {/* Move to another zone */}
                      <Select
                        value={String(zone.id)}
                        onValueChange={(newZone) =>
                          handleTableZoneChange(table.id, newZone)
                        }
                      >
                        <SelectTrigger className="h-6 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No zone</SelectItem>
                          {zones.map((z) => (
                            <SelectItem key={z.id} value={String(z.id)}>
                              {z.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Unassigned tables */}
        {unassignedTables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">
                Unassigned Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unassignedTables.map((table) => (
                  <div
                    key={table.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5"
                  >
                    <span className="text-sm font-medium">
                      {table.table_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {table.seats} seats
                    </span>
                    <Select
                      value="none"
                      onValueChange={(newZone) =>
                        handleTableZoneChange(table.id, newZone)
                      }
                    >
                      <SelectTrigger className="h-6 w-28 text-xs">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No zone</SelectItem>
                        {zones.map((z) => (
                          <SelectItem key={z.id} value={String(z.id)}>
                            {z.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete zone confirmation */}
      <AlertDialog
        open={!!zoneToDelete}
        onOpenChange={(open) => !open && setZoneToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{zoneToDelete?.name}"? Tables in
              this zone will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
