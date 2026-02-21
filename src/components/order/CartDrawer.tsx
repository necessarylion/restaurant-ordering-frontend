/**
 * Cart Drawer Component
 * Slide-in drawer showing cart items and checkout
 */

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useCreateGuestOrder } from "@/hooks/useOrders";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Remove01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const {
    items,
    total,
    restaurantId,
    tableToken,
    updateQuantity,
    updateNotes,
    removeItem,
    clear,
  } = useCart();
  const createOrderMutation = useCreateGuestOrder();
  const { currentRestaurant } = useRestaurant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = currentRestaurant?.currency || "USD";

  const handleCheckout = async () => {
    if (!restaurantId || !tableToken || items.length === 0) {
      alert("Cart is empty or invalid session");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        menu_item_id: item.menu_item.id,
        quantity: item.quantity,
        notes: item.notes,
      }));

      await createOrderMutation.mutateAsync({
        restaurantId,
        token: tableToken,
        order_type: OrderType.DINE_IN,
        items: orderItems,
      });

      clear();
      onOpenChange(false);

      // Navigate to success page (we'll create this later)
      alert("Order placed successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div
                  key={item.menu_item.id}
                  className="flex gap-3 pb-4 border-b"
                >
                  {/* Item Image */}
                  {item.menu_item.images && item.menu_item.images.length > 0 ? (
                    <img
                      src={item.menu_item.images[0].image}
                      alt={item.menu_item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Item Name & Price */}
                    <h4 className="font-medium">{item.menu_item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.menu_item.price, currency)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.menu_item.id,
                            item.quantity - 1
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        <HugeiconsIcon
                          icon={Remove01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(
                            item.menu_item.id,
                            item.quantity + 1
                          )
                        }
                        className="h-7 w-7 p-0"
                      >
                        <HugeiconsIcon
                          icon={Add01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.menu_item.id)}
                        className="h-7 w-7 p-0 ml-auto text-destructive"
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </Button>
                    </div>

                    {/* Notes Input */}
                    <Input
                      placeholder="Add notes (optional)"
                      value={item.notes || ""}
                      onChange={(e) =>
                        updateNotes(item.menu_item.id, e.target.value)
                      }
                      className="mt-2 h-8 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Total & Checkout */}
            <SheetFooter className="border-t pt-4 flex-col gap-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
