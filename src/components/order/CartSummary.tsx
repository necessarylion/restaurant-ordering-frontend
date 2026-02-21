/**
 * Cart Summary Component
 * Floating cart button that shows item count and toggles cart drawer
 */

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "./CartDrawer";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";

export const CartSummary = () => {
  const { itemCount } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (itemCount === 0) {
    return null; // Don't show cart button if empty
  }

  return (
    <>
      {/* Floating Cart Button */}
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
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
};
