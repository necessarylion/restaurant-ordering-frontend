/**
 * Order List Page
 * Display and manage all orders for a restaurant (staff view)
 */

import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useOrders, useUpdateOrder } from "@/hooks/useOrders";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InboxIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Fire02Icon,
  HotelBellIcon,
  Tick02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { OrderStatus, type Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ErrorCard } from "@/components/ErrorCard";

export const OrderListPage = () => {
  const { currentRestaurant } = useRestaurant();
  const { data: orders = [], isLoading, error } = useOrders(currentRestaurant?.id);
  const updateOrderMutation = useUpdateOrder();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const currency = currentRestaurant?.currency || "USD";

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!currentRestaurant || !selectedOrder || !newStatus) return;

    try {
      await updateOrderMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        orderId: selectedOrder.id,
        order_type: selectedOrder.order_type,
        status: newStatus,
        table_id: selectedOrder.table_id || undefined,
        items:
          selectedOrder.order_items?.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            notes: item.notes || undefined,
          })) || [],
      });
      setSelectedOrder(null);
    } catch (error: any) {
      alert(error.message || "Failed to update order");
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (!currentRestaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Restaurant Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please select a restaurant to view orders.
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
        title="Error Loading Orders"
        message={(error as any).message || "Failed to load orders"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage orders for {currentRestaurant.name}
        </p>
      </div>

      {/* Status Filter */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="gap-2">
          <TabsTrigger value="all">
            <HugeiconsIcon icon={InboxIcon} strokeWidth={2} className="size-4" />
            All
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.PENDING}>
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.CONFIRMED}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
            Confirmed
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.PREPARING}>
            <HugeiconsIcon icon={Fire02Icon} strokeWidth={2} className="size-4" />
            Preparing
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.READY}>
            <HugeiconsIcon icon={HotelBellIcon} strokeWidth={2} className="size-4" />
            Ready
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.COMPLETED}>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.CANCELLED}>
            <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} className="size-4" />
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {filterStatus === "all"
                ? "No orders yet."
                : `No ${filterStatus} orders.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {formatDateTime(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Table</p>
                    <p className="font-medium">
                      {selectedOrder.table?.table_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedOrder.order_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2 border rounded-lg p-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm pb-2 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {item.quantity}x {item.menu_item?.name || "Item"}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity, currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.total, currency)}</span>
                </div>

                {/* Update Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Update Status
                  </label>
                  <Select
                    value={newStatus || selectedOrder.status}
                    onValueChange={(value) => setNewStatus(value as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={OrderStatus.CONFIRMED}>
                        Confirmed
                      </SelectItem>
                      <SelectItem value={OrderStatus.PREPARING}>
                        Preparing
                      </SelectItem>
                      <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
                      <SelectItem value={OrderStatus.COMPLETED}>
                        Completed
                      </SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={
                    updateOrderMutation.isPending ||
                    newStatus === selectedOrder.status
                  }
                >
                  {updateOrderMutation.isPending
                    ? "Updating..."
                    : "Update Status"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
