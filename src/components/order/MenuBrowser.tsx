/**
 * Menu Browser Component
 * Shared menu browsing UI used by both Guest and Staff order pages.
 * Includes search, category tabs, and menu item grid.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCartAdd01Icon,
  GridViewIcon,
  Menu01Icon,
  Search01Icon,
  Cancel01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import type { MenuItem, Category } from "@/types";
import { formatPrice } from "@/lib/utils";

const MenuItemImage = ({ item }: { item: MenuItem }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedImages = item.images
    ? [...item.images].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  if (sortedImages.length === 0) {
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">{t("common.noImage")}</span>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-48">
      <img
        src={sortedImages[currentIndex]?.image}
        alt={item.name}
        className="w-full h-full object-cover"
      />
      {sortedImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + sortedImages.length) % sortedImages.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % sortedImages.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity"
          >
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className="size-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`size-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface MenuBrowserProps {
  menuItems: MenuItem[];
  categories: Category[];
  currency: string;
  onAddItem: (item: MenuItem) => void;
  getItemQuantity?: (menuItemId: number) => number;
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export const MenuBrowser = ({
  menuItems,
  categories,
  currency,
  onAddItem,
  getItemQuantity,
  searchInput,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: MenuBrowserProps) => {
  const { t } = useTranslation();
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const availableMenuItems = menuItems.filter((item) => item.is_available);

  const activeCategories = categories.length > 0
    ? categories.filter((cat) => cat.is_active).sort((a, b) => a.sort_order - b.sort_order)
    : availableMenuItems
        .map((item) => item.category)
        .filter(
          (cat, index, self): cat is NonNullable<typeof cat> =>
            cat != null && self.findIndex((c) => c?.id === cat.id) === index
        );

  const filteredMenuItems =
    selectedCategory === "all"
      ? availableMenuItems
      : availableMenuItems.filter(
          (item) => item.category_id === Number(selectedCategory)
        );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          placeholder={t("menu.searchMenu")}
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {activeCategories.length > 0 && (
        <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
          <TabsList className="w-full justify-start overflow-x-auto gap-2">
            <TabsTrigger value="all">
              <HugeiconsIcon
                icon={GridViewIcon}
                strokeWidth={2}
                className="size-4"
              />
              {t("common.all")} ({availableMenuItems.length})
            </TabsTrigger>
            {activeCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id.toString()}>
                <HugeiconsIcon
                  icon={Menu01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                {category.name} (
                {
                  availableMenuItems.filter(
                    (item) => item.category_id === category.id
                  ).length
                }
                )
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Menu Items Grid */}
      {filteredMenuItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("menu.noMenuAvailable")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredMenuItems.map((item) => {
            const quantity = getItemQuantity?.(item.id) ?? 0;
            return (
              <Card key={item.id} className="flex flex-col overflow-hidden pt-0">
                {/* Image */}
                <MenuItemImage item={item} />

                <CardContent className="flex flex-col flex-1 p-4">
                  <div className="space-y-2 flex-1 mb-2">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {quantity > 0 && (
                        <Badge variant="default" className="shrink-0">
                          {quantity}
                        </Badge>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-md text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.category && (
                    <Badge variant="secondary" className="text-xs w-fit">
                      {item.category.name}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-yellow-500">
                      {formatPrice(item.price, currency)}
                    </span>
                    <div className="flex gap-1">
                      <Button size="icon-sm" variant="outline" onClick={() => setDetailItem(item)}>
                        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-4" />
                      </Button>
                      <Button size="sm" onClick={() => onAddItem(item)}>
                        <HugeiconsIcon
                          icon={ShoppingCartAdd01Icon}
                          strokeWidth={2}
                          className="size-4 mr-1"
                        />
                        {t("common.add")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Menu Item Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent className="sm:max-w-lg">
          {detailItem && (
            <>
              <DialogHeader>
                <DialogTitle>{detailItem.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <MenuItemImage item={detailItem} />

                {detailItem.description && (
                  <p className="text-sm text-muted-foreground">
                    {detailItem.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-yellow-500">
                      {formatPrice(detailItem.price, currency)}
                    </span>
                    {detailItem.category && (
                      <Badge variant="secondary">{detailItem.category.name}</Badge>
                    )}
                  </div>
                  <Button onClick={() => { onAddItem(detailItem); setDetailItem(null); }}>
                    <HugeiconsIcon
                      icon={ShoppingCartAdd01Icon}
                      strokeWidth={2}
                      className="size-4 mr-1"
                    />
                    {t("menu.addToOrder")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
