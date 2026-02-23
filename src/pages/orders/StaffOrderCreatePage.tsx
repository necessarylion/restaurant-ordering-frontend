/**
 * Staff Order Create Page
 * Staff can browse menu items, build an order, and submit it for a specific table
 */

import { useState, useMemo, useDeferredValue } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { useTables } from "@/hooks/useTables";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuBrowser } from "@/components/order/MenuBrowser";
import { OrderItemsList } from "@/components/order/OrderItemsList";
import type { OrderItemEntry } from "@/components/order/OrderItemsList";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ShoppingCart01Icon, TableRoundIcon } from "@hugeicons/core-free-icons";
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

  const [searchInput, setSearchInput] = useState("");
  const deferredKeyword = useDeferredValue(searchInput);

  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems(
    currentRestaurant?.id,
    deferredKeyword || undefined
  );
  const { data: tables = [] } = useTables(currentRestaurant?.id);
  const createOrderMutation = useCreateOrder();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const table = tableId ? tables.find((t) => t.id === Number(tableId)) : null;
  const currency = currentRestaurant?.currency || "USD";

  const orderItemEntries: OrderItemEntry[] = useMemo(
    () =>
      orderItems.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        notes: item.notes,
        image: item.menuItem.images?.[0]?.image,
      })),
    [orderItems]
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

  const getItemQuantity = (menuItemId: number) => {
    return orderItems.find((i) => i.menuItem.id === menuItemId)?.quantity ?? 0;
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
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(tableId ? `/dashboard/tables?tableId=${tableId}` : "/dashboard/tables")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">New Order</h1>
        {table && (
          <Badge variant="outline" className="text-sm gap-1 ml-auto mt-1 p-3">
            <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4" />
            {table.table_number}
          </Badge>
        )}
      </div>

      {/* Menu Browser */}
      <MenuBrowser
        menuItems={menuItems}
        categories={categories}
        currency={currency}
        onAddItem={addItem}
        getItemQuantity={getItemQuantity}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg relative"
            onClick={() => setIsDrawerOpen(true)}
          >
            <HugeiconsIcon
              icon={ShoppingCart01Icon}
              strokeWidth={2}
              className="size-6"
            />
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
            >
              {itemCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Order Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Your Order</SheetTitle>
          </SheetHeader>

          {orderItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">No items added yet</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 px-4">
                <OrderItemsList
                  items={orderItemEntries}
                  currency={currency}
                  onUpdateQuantity={updateQuantity}
                  onUpdateNotes={updateNotes}
                  onRemoveItem={removeItem}
                />
              </div>

              <SheetFooter className="border-t pt-4 flex-col gap-3">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={orderItems.length === 0 || createOrderMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
