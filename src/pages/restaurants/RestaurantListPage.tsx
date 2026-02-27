/**
 * Restaurant List Page
 * Display all restaurants with create/edit/delete functionality
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurants, useCreateRestaurant, useUpdateRestaurant, useDeleteRestaurant } from "@/hooks/useRestaurants";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Restaurant } from "@/types";
import type { RestaurantFormData } from "@/schemas/restaurant_schema";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

export const RestaurantListPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: restaurants = [], isLoading, error } = useRestaurants();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["restaurants"] });
  }, [queryClient]);
  const createMutation = useCreateRestaurant();
  const updateMutation = useUpdateRestaurant();
  const deleteMutation = useDeleteRestaurant();

  const { confirm } = useAlertDialog();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const toInput = (data: RestaurantFormData) => ({
    ...data,
    logo: data.logo?.[0],
  });

  const handleCreate = async (data: RestaurantFormData) => {
    try {
      const newRestaurant = await createMutation.mutateAsync(toInput(data));
      setShowCreateForm(false);
      setCurrentRestaurant(newRestaurant);
    } catch (error: any) {
      alert(error.message || t("restaurant.failedToCreate"));
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setShowCreateForm(false);
  };

  const handleUpdate = async (data: RestaurantFormData) => {
    if (!editingRestaurant) return;
    try {
      const updated = await updateMutation.mutateAsync({
        id: editingRestaurant.id,
        data: toInput(data),
      });
      setEditingRestaurant(null);
      // Update selected restaurant if it was the one edited
      if (currentRestaurant?.id === updated.id) {
        setCurrentRestaurant(updated);
      }
    } catch (error: any) {
      alert(error.message || t("restaurant.failedToUpdate"));
    }
  };

  const handleSelect = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
  };

  const handleDelete = async (restaurant: Restaurant) => {
    const confirmed = await confirm({
      title: t("restaurant.deleteRestaurant"),
      description: t("restaurant.deleteConfirm", { name: restaurant.name }),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(restaurant.id);

      // If deleted restaurant was selected, clear selection
      if (currentRestaurant?.id === restaurant.id) {
        setCurrentRestaurant(null);
      }
    } catch (error: any) {
      alert(error.message || t("restaurant.failedToDelete"));
    }
  };

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
        title={t("restaurant.errorLoading")}
        message={(error as any).message || t("restaurant.failedToLoad")}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        <PageHeader title={t("restaurant.myRestaurants")}>
          <Button onClick={() => setShowCreateForm(true)}>
            {t("restaurant.createRestaurant")}
          </Button>
        </PageHeader>

        <Dialog open={showCreateForm} onOpenChange={(open) => !open && setShowCreateForm(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("restaurant.createNewRestaurant")}</DialogTitle>
            </DialogHeader>
            <RestaurantForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingRestaurant} onOpenChange={(open) => !open && setEditingRestaurant(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("restaurant.editRestaurant")}</DialogTitle>
            </DialogHeader>
            {editingRestaurant && (
              <RestaurantForm
                restaurant={editingRestaurant}
                onSubmit={handleUpdate}
                onCancel={() => setEditingRestaurant(null)}
                isSubmitting={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {t("restaurant.noRestaurantsYet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSelected={currentRestaurant?.id === restaurant.id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
