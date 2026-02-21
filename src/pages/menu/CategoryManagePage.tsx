/**
 * Category Manage Page
 * Display and manage all categories for a restaurant
 */

import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { CategoryCard } from "@/components/menu/CategoryCard";
import { CategoryForm } from "@/components/menu/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";

export const CategoryManagePage = () => {
  const { currentRestaurant } = useRestaurant();
  const {
    data: categories = [],
    isLoading,
    error,
  } = useCategories(currentRestaurant?.id);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const { confirm } = useAlertDialog();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreate = async (data: any) => {
    if (!currentRestaurant) return;

    try {
      await createMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        name: data.name,
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) : 0,
        image: data.image,
      });
      setShowCreateForm(false);
    } catch (error: any) {
      alert(error.message || "Failed to create category");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!currentRestaurant || !editingCategory) return;

    try {
      await updateMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        categoryId: editingCategory.id,
        name: data.name,
        sort_order: data.sort_order ? parseInt(data.sort_order, 10) : 0,
        is_active: data.is_active,
        image: data.image,
      });
      setEditingCategory(null);
    } catch (error: any) {
      alert(error.message || "Failed to update category");
    }
  };

  const handleDelete = async (category: Category) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: "Delete Category?",
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone and may affect existing menu items.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        categoryId: category.id,
      });
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
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
              Please select a restaurant to manage categories.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Error Loading Categories"
        message={(error as any).message || "Failed to load categories"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage menu categories for {currentRestaurant.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingCategory(null);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Category"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              category={editingCategory}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No categories yet. Create your first category to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={(c) => {
                  setEditingCategory(c);
                  setShowCreateForm(false);
                }}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}

    </div>
  );
};
