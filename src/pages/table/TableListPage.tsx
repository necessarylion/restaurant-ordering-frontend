/**
 * Table List Page
 * Display and manage all tables for a restaurant
 */

import { useState, useMemo } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useGenerateTableToken,
  useZones,
} from "@/hooks/useTables";
import { TableCard } from "@/components/table/TableCard";
import { TableForm } from "@/components/table/TableForm";
import { TableQRCode } from "@/components/table/TableQRCode";
import { FloorPlanCanvas } from "@/components/table/FloorPlanCanvas";
import { ZoneManagement } from "@/components/table/ZoneManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { FloorPlanIcon, TableRoundIcon, CellsIcon, SeatSelectorIcon } from "@hugeicons/core-free-icons";
import type { Table } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

export const TableListPage = () => {
  const { currentRestaurant } = useRestaurant();
  const {
    data: tables = [],
    isLoading,
    error,
  } = useTables(currentRestaurant?.id);
  const { data: zones = [] } = useZones(currentRestaurant?.id);
  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();
  const deleteMutation = useDeleteTable();
  const generateTokenMutation = useGenerateTableToken();

  const { confirm } = useAlertDialog();

  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);

  const filteredStats = useMemo(() => {
    const filtered = activeZoneId === null ? tables : tables.filter((t) => t.zone_id === activeZoneId);
    const result = { tables: filtered.length, seats: 0, available: 0, booked: 0, unavailable: 0 };
    filtered.forEach((t) => {
      result.seats += t.seats;
      result[t.status]++;
    });
    return result;
  }, [tables, activeZoneId]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{
    table: Table;
    token: string;
    expiresAt: string;
  } | null>(null);

  const handleCreate = async (data: {
    table_number: string;
    seats: number;
    zone_id?: number;
    is_active: boolean;
  }) => {
    if (!currentRestaurant) return;

    try {
      await createMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        table_number: data.table_number,
        seats: data.seats,
        zone_id: data.zone_id,
      });
      setShowCreateForm(false);
    } catch (error: any) {
      alert(error.message || "Failed to create table");
    }
  };

  const handleUpdate = async (data: {
    table_number: string;
    seats: number;
    zone_id?: number;
    is_active: boolean;
  }) => {
    if (!currentRestaurant || !editingTable) return;

    try {
      await updateMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: editingTable.id,
        table_number: data.table_number,
        is_active: data.is_active,
        seats: data.seats,
        zone_id: data.zone_id ?? null,
        position_x: editingTable.position_x,
        position_y: editingTable.position_y,
      });
      setEditingTable(null);
    } catch (error: any) {
      alert(error.message || "Failed to update table");
    }
  };

  const handleDelete = async (table: Table) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: "Delete Table?",
      description: `Are you sure you want to delete "${table.table_number}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to delete table");
    }
  };

  const handleGenerateQR = async (table: Table) => {
    if (!currentRestaurant) return;

    try {
      const result = await generateTokenMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: table.id,
      });
      setQrCodeData({
        table,
        token: result.token,
        expiresAt: result.expires_at,
      });
    } catch (error: any) {
      alert(error.message || "Failed to generate QR code");
    }
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
              Please select a restaurant to manage tables.
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
        title="Error Loading Tables"
        message={(error as any).message || "Failed to load tables"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tables" description={`Manage tables and QR codes for ${currentRestaurant.name}`}>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingTable(null);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Table"}
        </Button>
      </PageHeader>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Table</CardTitle>
          </CardHeader>
          <CardContent>
            <TableForm
              zones={zones}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingTable && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Table</CardTitle>
          </CardHeader>
          <CardContent>
            <TableForm
              table={editingTable}
              zones={zones}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTable(null)}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* View Tabs */}
      <Tabs defaultValue="floorplan">
        <div className="flex items-center justify-between mb-3">
          <TabsList className="gap-2">
            <TabsTrigger value="floorplan">
              <HugeiconsIcon icon={FloorPlanIcon} strokeWidth={2} className="size-4" />
              Floor Plan
            </TabsTrigger>
            <TabsTrigger value="list">
              <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="zones">
              <HugeiconsIcon icon={CellsIcon} strokeWidth={2} className="size-4" />
              Zones
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4" />
              {filteredStats.tables}
            </span>
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={SeatSelectorIcon} strokeWidth={2} className="size-4" />
              {filteredStats.seats}
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-green-500" />
              {filteredStats.available}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500" />
              {filteredStats.booked}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              {filteredStats.unavailable}
            </span>
          </div>
        </div>

        <TabsContent value="list">
          {tables.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No tables yet. Create your first table to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onEdit={(t) => {
                    setEditingTable(t);
                    setShowCreateForm(false);
                  }}
                  onDelete={handleDelete}
                  onGenerateQR={handleGenerateQR}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="floorplan">
          <FloorPlanCanvas activeZoneId={activeZoneId} onActiveZoneChange={setActiveZoneId} />
        </TabsContent>

        <TabsContent value="zones">
          <ZoneManagement />
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={!!qrCodeData} onOpenChange={(open) => !open && setQrCodeData(null)}>
        <DialogContent className="sm:max-w-md">
          {qrCodeData && currentRestaurant && (
            <TableQRCode
              tableName={qrCodeData.table.table_number}
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
