/**
 * Order Card Component
 * Display order summary in a card format
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useRestaurant } from "@/hooks/useRestaurant";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

export const OrderCard = ({ order, onViewDetails }: OrderCardProps) => {
  const { currentRestaurant } = useRestaurant();
  const currency = currentRestaurant?.currency || "USD";

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(order.created_at)}
            </p>
            {order.table && (
              <p className="text-sm text-muted-foreground">
                Table: {order.table.table_number}
              </p>
            )}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Items */}
        <div className="space-y-1">
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.quantity}x {item.menu_item?.name || "Item"}
                </span>
                <span>{formatPrice(item.price * item.quantity, currency)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No items</p>
          )}
          {order.order_items && order.order_items.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{order.order_items.length - 3} more items
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between pt-2 border-t font-semibold">
          <span>Total:</span>
          <span>{formatPrice(order.total, currency)}</span>
        </div>

        {/* Actions */}
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order)}
            className="w-full"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4 mr-1"
            />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
