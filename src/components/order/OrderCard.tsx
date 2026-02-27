/**
 * Order Card Component
 * Draggable order card for kanban board
 */

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  TableRoundIcon,
  Restaurant01Icon,
  ShoppingBag02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { OrderType, type Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

export const OrderCard = forwardRef<HTMLDivElement, OrderCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ order, onViewDetails, isDragging, style, className, ...props }, ref) => {
    const { t } = useTranslation();
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
      <Card
        ref={ref}
        style={style}
        className={`flex flex-col transition-shadow cursor-grab active:cursor-grabbing ${
          isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md"
        } ${className || ""}`}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">{t("order.orderNumber", { id: order.id })}</h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <Badge variant="outline" className="w-fit">
            <HugeiconsIcon
              icon={order.order_type === OrderType.DINE_IN ? Restaurant01Icon : ShoppingBag02Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            {order.order_type === OrderType.DINE_IN ? t("order.dineIn") : t("order.takeaway")}
          </Badge>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5 shrink-0" />
              <span className="text-xs">{formatDateTime(order.created_at)}</span>
            </div>
            {order.table && (
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-3.5 shrink-0" />
                <span className="text-xs">{order.table.table_number}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="mt-auto space-y-2">
          {/* Order Items */}
          <div className="space-y-1.5">
            {order.order_items && order.order_items.length > 0 ? (
              <>
                {order.order_items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="pb-1.5 border-b last:border-0 last:pb-0"
                  >
                    <p className="text-xs font-medium">
                      {item.quantity}x {item?.name || "Item"}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
                {order.order_items.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    {t("order.moreItems", { count: order.order_items.length - 3 })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t("order.noItems")}</p>
            )}
          </div>

          {/* Actions */}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(order);
              }}
              className="w-full"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4 mr-1"
              />
              {t("order.viewDetails")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
);

OrderCard.displayName = "OrderCard";
