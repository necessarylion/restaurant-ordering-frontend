/**
 * Menu Item Card Component
 * Displays menu item information in a card format
 */

import type { MenuItem } from "@/types";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, Delete02Icon, Image01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit?: (menuItem: MenuItem) => void;
  onDelete?: (menuItem: MenuItem) => void;
  showCategory?: boolean;
}

export const MenuItemCard = ({
  menuItem,
  onEdit,
  onDelete,
  showCategory = false,
}: MenuItemCardProps) => {
  const { currentRestaurant } = useRestaurant();
  const primaryImage =
    menuItem.images && menuItem.images.length > 0
      ? menuItem.images.sort((a, b) => a.sort_order - b.sort_order)[0].image
      : null;

  const currency = currentRestaurant?.currency || "USD";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow pt-0">
      {/* Menu Item Image */}
      {primaryImage ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={menuItem.name}
            className="h-full w-full object-cover"
          />
          {menuItem.images && menuItem.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{menuItem.images.length - 1} more
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-12 text-muted-foreground/30" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{menuItem.name}</CardTitle>
            {menuItem.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {menuItem.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {showCategory && menuItem.category && (
                <Badge variant="outline">{menuItem.category.name}</Badge>
              )}
              {menuItem.is_available ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5 text-green-500" />
              ) : (
                <Badge variant="secondary">Unavailable</Badge>
              )}
              <span className="text-lg font-bold text-primary">
                {formatPrice(menuItem.price, currency)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {(onEdit || onDelete) && (
        <CardContent>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(menuItem)}
                className="flex-1"
              >
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(menuItem)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
