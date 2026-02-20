/**
 * Table List Page
 * Display and manage all tables for a restaurant
 */

import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { FloorPlanIcon, ListViewIcon, Layers01Icon } from "@hugeicons/core-free-icons";
import type { Table } from "@/types";

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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
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

  const handleDelete = async () => {
    if (!currentRestaurant || !tableToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        tableId: tableToDelete.id,
      });
      setTableToDelete(null);
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
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              {(error as any).message || "Failed to load tables"}
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
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-muted-foreground">
            Manage tables and QR codes for {currentRestaurant.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingTable(null);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Table"}
        </Button>
      </div>

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
        <TabsList className="gap-2">
          <TabsTrigger value="floorplan">
            <HugeiconsIcon icon={FloorPlanIcon} strokeWidth={2} className="size-4" />
            Floor Plan
          </TabsTrigger>
          <TabsTrigger value="list">
            <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} className="size-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="zones">
            <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-4" />
            Zones
          </TabsTrigger>
        </TabsList>

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
                  onDelete={(t) => setTableToDelete(t)}
                  onGenerateQR={handleGenerateQR}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="floorplan">
          <FloorPlanCanvas />
        </TabsContent>

        <TabsContent value="zones">
          <ZoneManagement />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!tableToDelete}
        onOpenChange={(open) => !open && setTableToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tableToDelete?.table_number}"?
              This action cannot be undone.
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
