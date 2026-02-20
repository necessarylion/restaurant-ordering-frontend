/**
 * Order Status Badge Component
 * Color-coded status badges for orders
 */

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
      case OrderStatus.CONFIRMED:
        return {
          label: "Confirmed",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        };
      case OrderStatus.PREPARING:
        return {
          label: "Preparing",
          variant: "secondary" as const,
          className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        };
      case OrderStatus.READY:
        return {
          label: "Ready",
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
      case OrderStatus.CANCELLED:
        return {
          label: "Cancelled",
          variant: "destructive" as const,
          className: "",
        };
      case OrderStatus.COMPLETED:
        return {
          label: "Completed",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
