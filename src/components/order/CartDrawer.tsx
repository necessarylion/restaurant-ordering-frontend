/**
 * Cart Drawer Component
 * Slide-in drawer showing cart items and checkout
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useCreateGuestOrder } from "@/hooks/useOrders";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { OrderItemsList } from "./OrderItemsList";
import type { OrderItemEntry } from "./OrderItemsList";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { t } = useTranslation();
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
  const { alert } = useAlertDialog();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = currentRestaurant?.currency || "USD";

  const orderItemEntries: OrderItemEntry[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.menu_item.id,
        name: item.menu_item.name,
        price: item.menu_item.price,
        quantity: item.quantity,
        notes: item.notes || "",
        image: item.menu_item.images?.[0]?.image,
      })),
    [items]
  );

  const handleCheckout = async () => {
    if (!restaurantId || !tableToken || items.length === 0) {
      await alert({ title: t("common.error"), description: t("order.cartEmptyOrInvalid") });
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

      await alert({ title: t("order.orderPlaced"), description: t("order.orderPlacedSuccess") });
    } catch (error: any) {
      await alert({ title: t("common.error"), description: error.message || t("order.failedToPlaceOrder") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("order.yourOrder")}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{t("order.cartEmpty")}</p>
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
                <span>{t("common.total")}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? t("order.placingOrder") : t("order.placeOrder")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
