/**
 * Staff Order Create Page
 * Staff can browse menu items, build an order, and submit it for a specific table
 */

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { useTables } from "@/hooks/useTables";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Remove01Icon,
  Delete02Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { OrderType, type MenuItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export const StaffOrderCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  const { currentRestaurant } = useRestaurant();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    currentRestaurant?.id
  );
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems(
    currentRestaurant?.id
  );
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const createOrderMutation = useCreateOrder();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const table = tableId ? tables.find((t) => t.id === Number(tableId)) : null;
  const currency = currentRestaurant?.currency || "USD";

  const activeCategories = categories.filter((cat) => cat.is_active);
  const availableMenuItems = menuItems.filter((item) => item.is_available);

  const filteredMenuItems =
    selectedCategory === "all"
      ? availableMenuItems
      : availableMenuItems.filter(
          (item) => item.category_id === Number(selectedCategory)
        );

  const total = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      ),
    [orderItems]
  );

  const itemCount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.quantity, 0),
    [orderItems]
  );

  const addItem = (menuItem: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menuItem, quantity: 1, notes: "" }];
    });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      )
    );
  };

  const updateNotes = (menuItemId: number, notes: string) => {
    setOrderItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, notes } : i
      )
    );
  };

  const removeItem = (menuItemId: number) => {
    setOrderItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  };

  const handleSubmit = async () => {
    if (!currentRestaurant || orderItems.length === 0) return;

    try {
      await createOrderMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        order_type: OrderType.DINE_IN,
        table_id: tableId ? Number(tableId) : undefined,
        items: orderItems.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      });
      navigate(tableId ? `/dashboard/tables?tableId=${tableId}` : "/dashboard/tables");
    } catch (error: any) {
      alert(error.message || "Failed to create order");
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
              Please select a restaurant first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categoriesLoading || menuLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(tableId ? `/dashboard/tables?tableId=${tableId}` : "/dashboard/tables")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Order</h1>
          <p className="text-sm text-muted-foreground">
            {table ? `Table ${table.table_number}` : "No table selected"}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: Menu Browser */}
        <div className="flex-1 space-y-4">
          {/* Category Tabs */}
          {activeCategories.length > 0 && (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="gap-2">
                <TabsTrigger value="all">All</TabsTrigger>
                {activeCategories
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </TabsTrigger>
                  ))}
              </TabsList>
            </Tabs>
          )}

          {/* Menu Items Grid */}
          {filteredMenuItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No menu items available.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => {
                const inOrder = orderItems.find(
                  (o) => o.menuItem.id === item.id
                );
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => addItem(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].image}
                            alt={item.name}
                            className="size-16 object-cover rounded-md shrink-0"
                          />
                        ) : (
                          <div className="size-16 bg-muted rounded-md flex items-center justify-center shrink-0">
                            <span className="text-[10px] text-muted-foreground">
                              No img
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-medium truncate">
                              {item.name}
                            </h4>
                            {inOrder && (
                              <Badge variant="default" className="shrink-0 text-xs">
                                {inOrder.quantity}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(item.price, currency)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="w-80 shrink-0">
          <div className="sticky top-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Order Summary
                  {itemCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {itemCount} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click menu items to add them to the order.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="space-y-2 pb-3 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.menuItem.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(
                                item.menuItem.price * item.quantity,
                                currency
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.menuItem.id)}
                            className="h-6 w-6 p-0 text-destructive shrink-0"
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              strokeWidth={2}
                              className="size-3.5"
                            />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity - 1
                              )
                            }
                            className="h-7 w-7 p-0"
                          >
                            <HugeiconsIcon
                              icon={Remove01Icon}
                              strokeWidth={2}
                              className="size-3.5"
                            />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity + 1
                              )
                            }
                            className="h-7 w-7 p-0"
                          >
                            <HugeiconsIcon
                              icon={Add01Icon}
                              strokeWidth={2}
                              className="size-3.5"
                            />
                          </Button>
                        </div>

                        {/* Notes */}
                        <Input
                          placeholder="Notes (optional)"
                          value={item.notes}
                          onChange={(e) =>
                            updateNotes(item.menuItem.id, e.target.value)
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={orderItems.length === 0 || createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
