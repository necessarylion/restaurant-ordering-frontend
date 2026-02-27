/**
 * Order Status Badge Component
 * Color-coded status badges with icons for orders
 */

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock04Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  TaskDone02Icon,
  Loading03Icon,
  DeliveryBox01Icon,
} from "@hugeicons/core-free-icons";
import { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { labelKey: string; icon: any; className: string }> = {
  [OrderStatus.PENDING]: {
    labelKey: "order.pending",
    icon: Clock04Icon,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [OrderStatus.CONFIRMED]: {
    labelKey: "order.confirmed",
    icon: CheckmarkCircle02Icon,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  [OrderStatus.PREPARING]: {
    labelKey: "order.preparing",
    icon: Loading03Icon,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  [OrderStatus.READY]: {
    labelKey: "order.ready",
    icon: DeliveryBox01Icon,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [OrderStatus.CANCELLED]: {
    labelKey: "order.cancelled",
    icon: Cancel01Icon,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  [OrderStatus.COMPLETED]: {
    labelKey: "order.completed",
    icon: TaskDone02Icon,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status] ?? {
    labelKey: status,
    icon: Clock04Icon,
    className: "",
  };

  return (
    <Badge className={config.className}>
      <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-3.5" />
      {t(config.labelKey)}
    </Badge>
  );
};
