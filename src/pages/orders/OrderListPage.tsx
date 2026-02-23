/**
 * Order List Page
 * Kanban board with drag-and-drop for managing orders by status
 */

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useOrders, useUpdateOrder } from "@/hooks/useOrders";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderDetailDialog } from "@/components/order/OrderDetailDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock04Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  DeliveryBox01Icon,
  TaskDone02Icon,
} from "@hugeicons/core-free-icons";
import { OrderStatus, type Order } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

const columns = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock04Icon,
    statuses: [OrderStatus.PENDING],
    dropStatus: OrderStatus.PENDING,
    headerClass: "text-amber-700 dark:text-amber-400",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckmarkCircle02Icon,
    statuses: [OrderStatus.CONFIRMED],
    dropStatus: OrderStatus.CONFIRMED,
    headerClass: "text-green-700 dark:text-green-400",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: Loading03Icon,
    statuses: [OrderStatus.PREPARING],
    dropStatus: OrderStatus.PREPARING,
    headerClass: "text-purple-700 dark:text-purple-400",
  },
  {
    key: "ready",
    label: "Ready",
    icon: DeliveryBox01Icon,
    statuses: [OrderStatus.READY],
    dropStatus: OrderStatus.READY,
    headerClass: "text-blue-700 dark:text-blue-400",
  },
  {
    key: "done",
    label: "Done",
    icon: TaskDone02Icon,
    statuses: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    dropStatus: OrderStatus.COMPLETED,
    headerClass: "text-green-700 dark:text-green-400",
  },
];

// Draggable order card wrapper
const DraggableOrderCard = ({
  order,
  onViewDetails,
}: {
  order: Order;
  onViewDetails: (order: Order) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `order-${order.id}`,
    data: { order },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <OrderCard
      ref={setNodeRef}
      order={order}
      onViewDetails={onViewDetails}
      isDragging={isDragging}
      style={style}
      {...listeners}
      {...attributes}
    />
  );
};

// Droppable column wrapper
const DroppableColumn = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto rounded-xl border border-dashed p-3 transition-all ${
        isOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-muted-foreground/20 bg-muted/30"
      }`}
    >
      {children}
    </div>
  );
};

export const OrderListPage = () => {
  const { currentRestaurant } = useRestaurant();
  const { data: orders = [], isLoading, error } = useOrders(currentRestaurant?.id);
  const updateOrderMutation = useUpdateOrder();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const ordersByColumn = useMemo(() => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = orders.filter(
      (o) => new Date(o.created_at).getTime() >= twoDaysAgo.getTime()
    );

    const grouped = new Map<string, Order[]>();
    for (const col of columns) {
      const colOrders = recentOrders
        .filter((o) => col.statuses.includes(o.status))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      grouped.set(col.key, colOrders);
    }
    return grouped;
  }, [orders]);

  const handleDragStart = (event: DragStartEvent) => {
    const order = event.active.data.current?.order as Order;
    setActiveOrder(order);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active, over } = event;
    if (!over || !currentRestaurant) return;

    const order = active.data.current?.order as Order;
    const targetColumn = columns.find((col) => col.key === over.id);
    if (!targetColumn) return;

    // Don't update if dropping in the same column
    if (targetColumn.statuses.includes(order.status)) return;

    const newOrderStatus = targetColumn.dropStatus;

    updateOrderMutation.mutate({
      restaurantId: currentRestaurant.id,
      orderId: order.id,
      order_type: order.order_type,
      status: newOrderStatus,
      table_id: order.table_id || undefined,
      items:
        order.order_items?.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })) || [],
    });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
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
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Orders" description={`Manage orders for ${currentRestaurant.name}`} />
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 flex-1 min-h-0">
          {columns.map((col) => {
            const colOrders = ordersByColumn.get(col.key) || [];
            return (
              <div key={col.key} className="flex-1 flex flex-col gap-3 min-h-0">
                {/* Column Header */}
                <div className={`flex items-center gap-2 px-1 shrink-0 ${col.headerClass}`}>
                  <HugeiconsIcon icon={col.icon} strokeWidth={2} className="size-4" />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="ml-auto text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Content */}
                <DroppableColumn id={col.key}>
                  {colOrders.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                      <p className="text-xs text-muted-foreground">No orders</p>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <DraggableOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeOrder && (
            <OrderCard
              order={activeOrder}
              className="shadow-xl rotate-2"
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Order Details Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
