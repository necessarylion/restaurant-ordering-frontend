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
import { PencilEdit01Icon, Delete01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";

interface MenuItemCardProps {
  menuItem: MenuItem;
  onEdit?: (menuItem: MenuItem) => void;
  onDelete?: (menuItem: MenuItem) => void;
  categoryName?: string;
}

export const MenuItemCard = ({
  menuItem,
  onEdit,
  onDelete,
  categoryName,
}: MenuItemCardProps) => {
  const { currentRestaurant } = useRestaurant();
  const primaryImage =
    menuItem.images && menuItem.images.length > 0
      ? menuItem.images.sort((a, b) => a.sort_order - b.sort_order)[0].image
      : null;

  const currency = currentRestaurant?.currency || "USD";

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow pt-0">
      {/* Menu Item Image */}
      <div className="relative">
        {primaryImage ? (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={primaryImage}
              alt={menuItem.name}
              className="h-full w-full object-cover"
            />
            {menuItem.images && menuItem.images.length > 1 && (
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                +{menuItem.images.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-12 text-muted-foreground/30" />
          </div>
        )}
        <Badge
          variant={menuItem.is_available ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {menuItem.is_available ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{menuItem.name}</CardTitle>
            {menuItem.description && (
              <p className="mt-1 text-md text-muted-foreground line-clamp-2">
                {menuItem.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="space-y-2">
          <div className="flex items-center">
            {categoryName && (
              <Badge variant="outline">{categoryName}</Badge>
            )}
            <div className="text-lg font-bold text-yellow-500 flex-1  text-right">
              {formatPrice(menuItem.price, currency)}
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(menuItem)}
                className="flex-1"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4 mr-1" />
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
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
