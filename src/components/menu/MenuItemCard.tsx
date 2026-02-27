/**
 * Menu Item Card Component
 * Displays menu item information in a card format
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MenuItem } from "@/types";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Delete01Icon, Image01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
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
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const sortedImages = menuItem.images
    ? [...menuItem.images].sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currency = currentRestaurant?.currency || "USD";

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow pt-0">
      {/* Menu Item Image */}
      <div className="relative group">
        {sortedImages.length > 0 ? (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={sortedImages[currentImageIndex]?.image}
              alt={menuItem.name}
              className="h-full w-full object-cover"
            />
            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i - 1 + sortedImages.length) % sortedImages.length); }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity"
                >
                  <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i + 1) % sortedImages.length); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity"
                >
                  <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className="size-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {sortedImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                      className={`size-1.5 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
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
          {menuItem.is_available ? t("common.available") : t("common.unavailable")}
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
                {t("common.edit")}
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
                {t("common.delete")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
