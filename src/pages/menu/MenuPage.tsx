/**
 * Menu Page
 * Display and manage all menu items organized by category
 */

import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, GridViewIcon } from "@hugeicons/core-free-icons";
import type { MenuItem } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";

export const MenuPage = () => {
  const { currentRestaurant } = useRestaurant();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories(currentRestaurant?.id);
  const {
    data: menuItems = [],
    isLoading: itemsLoading,
    error,
  } = useMenuItems(currentRestaurant?.id);
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
      alert(error.message || "Failed to create menu item");
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
      alert(error.message || "Failed to update menu item");
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: "Delete Menu Item?",
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        itemId: item.id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to delete menu item");
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
              Please select a restaurant to manage menu items.
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
        title="Error Loading Menu"
        message={(error as any).message || "Failed to load menu items"}
      />
    );
  }

  const activeCategories = categories.filter((cat) => cat.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage menu items for {currentRestaurant.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingItem(null);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Menu Item"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuItemForm
              categories={activeCategories}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuItemForm
              menuItem={editingItem}
              categories={activeCategories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="gap-2">
          <TabsTrigger value="all">
            <HugeiconsIcon icon={GridViewIcon} strokeWidth={2} className="size-4" />
            All Items ({menuItems.length})
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

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {selectedCategory === "all"
                    ? "No menu items yet. Create your first menu item to get started!"
                    : "No items in this category yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  menuItem={item}
                  showCategory={selectedCategory === "all"}
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
