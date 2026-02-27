/**
 * Menu Page
 * Display and manage all menu items organized by category
 */

import { useState, useMemo, useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { useCategories } from "@/hooks/useCategories";
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "@/hooks/useMenuItems";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { MenuItemForm } from "@/components/menu/MenuItemForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, GridViewIcon, Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import type { MenuItem } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

export const MenuPage = () => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories(currentRestaurant?.id);
  const [searchInput, setSearchInput] = useState("");
  const deferredKeyword = useDeferredValue(searchInput);

  const {
    data: menuItems = [],
    isLoading: itemsLoading,
    error,
  } = useMenuItems(currentRestaurant?.id, deferredKeyword || undefined);
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const { confirm } = useAlertDialog();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Group menu items by category
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<number, MenuItem[]>();

    menuItems.forEach((item) => {
      const items = grouped.get(item.category_id) || [];
      items.push(item);
      grouped.set(item.category_id, items);
    });

    return grouped;
  }, [menuItems]);

  // Filter menu items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return menuItems;
    }
    return menuItems.filter(
      (item) => item.category_id === parseInt(selectedCategory)
    );
  }, [menuItems, selectedCategory]);

  const handleCreate = async (data: any) => {
    if (!currentRestaurant) return;

    try {
      await createMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price, // Already in cents from schema transform
        images: data.images,
      });
      setShowCreateForm(false);
    } catch (error: any) {
      alert(error.message || t("menu.failedToCreate"));
    }
  };

  const handleUpdate = async (data: any) => {
    if (!currentRestaurant || !editingItem) return;

    try {
      await updateMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        itemId: editingItem.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price, // Already in cents from schema transform
        is_available: data.is_available,
        images: data.images,
      });
      setEditingItem(null);
    } catch (error: any) {
      alert(error.message || t("menu.failedToUpdate"));
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: t("menu.deleteMenuItem"),
      description: t("menu.deleteConfirm", { name: item.name }),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        itemId: item.id,
      });
    } catch (error: any) {
      alert(error.message || t("menu.failedToDelete"));
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("common.noRestaurantSelected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("menu.selectRestaurant")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title={t("menu.errorLoading")}
        message={(error as any).message || t("menu.failedToLoad")}
      />
    );
  }

  const activeCategories = categories.filter((cat) => cat.is_active);

  return (
    <div className="space-y-6">
      <PageHeader title={t("menu.title")} description={t("menu.description", { name: currentRestaurant.name })}>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingItem(null);
          }}
        >
          {t("menu.createMenuItem")}
        </Button>
      </PageHeader>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => !open && setShowCreateForm(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("menu.createNewMenuItem")}</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            categories={activeCategories}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("menu.editMenuItem")}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <MenuItemForm
              menuItem={editingItem}
              categories={activeCategories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex items-center justify-between gap-4">
          <TabsList className="gap-2">
          <TabsTrigger value="all">
            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
            {t("menu.allItems", { count: menuItems.length })}
          </TabsTrigger>
          {activeCategories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
              >
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-4" />
                {category.name} ({itemsByCategory.get(category.id)?.length || 0})
              </TabsTrigger>
            ))}
        </TabsList>

          <div className="relative w-64">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("menu.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
              </button>
            )}
          </div>
        </div>

        <TabsContent value={selectedCategory} className="mt-3">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {selectedCategory === "all"
                    ? t("menu.noMenuItemsYet")
                    : t("menu.noItemsInCategory")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  menuItem={item}
                  categoryName={selectedCategory === "all" ? categories.find((c) => c.id === item.category_id)?.name : undefined}
                  onEdit={(i) => {
                    setEditingItem(i);
                    setShowCreateForm(false);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
};
