/**
 * Order Items List Component
 * Shared list of order/cart items with quantity controls, notes, and delete.
 * Used by both CartDrawer (guest) and StaffOrderCreatePage (staff).
 */

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Remove01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";

export interface OrderItemEntry {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  image?: string;
}

interface OrderItemsListProps {
  items: OrderItemEntry[];
  currency: string;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onUpdateNotes: (itemId: number, notes: string) => void;
  onRemoveItem: (itemId: number) => void;
}

export const OrderItemsList = ({
  items,
  currency,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
}: OrderItemsListProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
          {/* Item Image */}
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs text-muted-foreground">{t("common.noImage")}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Item Name & Price */}
            <h4 className="font-medium truncate">{item.name}</h4>
            <p className="text-sm text-muted-foreground">
              {formatPrice(item.price, currency)}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="h-7 w-7 p-0"
              >
                <HugeiconsIcon
                  icon={Remove01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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
                onClick={() => onRemoveItem(item.id)}
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
              placeholder={t("order.addNotes")}
              value={item.notes}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              className="mt-2 h-8 text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
