/**
 * Order Detail Dialog Component
 * Shared dialog for viewing order details and updating status
 */

import { useState, useEffect } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useUpdateOrder } from "@/hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Restaurant01Icon,
  ShoppingBag02Icon,
} from "@hugeicons/core-free-icons";
import { OrderStatus, OrderType, type Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const OrderDetailDialog = ({
  order,
  onClose,
  onStatusUpdated,
}: OrderDetailDialogProps) => {
  const { currentRestaurant } = useRestaurant();
  const updateOrderMutation = useUpdateOrder();
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const currency = currentRestaurant?.currency || "USD";

  useEffect(() => {
    if (order) setNewStatus(order.status);
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!currentRestaurant || !order || !newStatus) return;
    try {
      await updateOrderMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        orderId: order.id,
        order_type: order.order_type,
        status: newStatus,
        table_id: order.table_id || undefined,
        items:
          order.order_items?.map((item) => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            notes: item.notes || undefined,
          })) || [],
      });
      onClose();
      onStatusUpdated?.();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle>Order #{order.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Table</p>
                  <p className="font-medium">
                    {order.table?.table_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline" className="mt-1">
                    <HugeiconsIcon
                      icon={order.order_type === OrderType.DINE_IN ? Restaurant01Icon : ShoppingBag02Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    {order.order_type === OrderType.DINE_IN ? "Dine In" : "Takeaway"}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2 border rounded-lg p-3">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm pb-2 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.quantity}x {item.name || "Item"}
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
                <span>{formatPrice(order.total, currency)}</span>
              </div>

              {/* Update Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Update Status
                </label>
                <Select
                  value={newStatus || order.status}
                  onValueChange={(value) => setNewStatus(value as OrderStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                    <SelectItem value={OrderStatus.PREPARING}>Preparing</SelectItem>
                    <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
                    <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  updateOrderMutation.isPending ||
                  newStatus === order.status
                }
              >
                {updateOrderMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
