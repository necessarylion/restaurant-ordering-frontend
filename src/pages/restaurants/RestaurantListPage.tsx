/**
 * Restaurant List Page
 * Display all restaurants with create/edit/delete functionality
 */

import { useState } from "react";
import { useRestaurants, useCreateRestaurant, useDeleteRestaurant } from "@/hooks/useRestaurants";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { RestaurantForm } from "@/components/restaurant/RestaurantForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Restaurant } from "@/types";
import type { RestaurantFormData } from "@/schemas/restaurant_schema";
import { ErrorCard } from "@/components/ErrorCard";

export const RestaurantListPage = () => {
  const { data: restaurants = [], isLoading, error } = useRestaurants();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
  const createMutation = useCreateRestaurant();
  const deleteMutation = useDeleteRestaurant();

  const { confirm } = useAlertDialog();

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = async (data: RestaurantFormData) => {
    try {
      const newRestaurant = await createMutation.mutateAsync(data);
      setShowCreateForm(false);
      setCurrentRestaurant(newRestaurant);
    } catch (error: any) {
      alert(error.message || "Failed to create restaurant");
    }
  };

  const handleSelect = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
  };

  const handleDelete = async (restaurant: Restaurant) => {
    const confirmed = await confirm({
      title: "Delete Restaurant?",
      description: `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
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
      alert(error.message || "Failed to delete restaurant");
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
        title="Error Loading Restaurants"
        message={(error as any).message || "Failed to load restaurants"}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Restaurants</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create Restaurant"}
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Restaurant</CardTitle>
            </CardHeader>
            <CardContent>
              <RestaurantForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
                isSubmitting={createMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No restaurants yet. Create your first restaurant to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={handleSelect}
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
