/**
 * Restaurant Dashboard Page
 * Overview and stats for selected restaurant
 */

import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useRestaurantById } from "@/hooks/useRestaurants";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const RestaurantDashboardPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
  const { data: restaurant, isLoading } = useRestaurantById(
    restaurantId ? parseInt(restaurantId) : undefined
  );

  // Sync current restaurant with context
  React.useEffect(() => {
    if (restaurant && (!currentRestaurant || currentRestaurant.id !== restaurant.id)) {
      setCurrentRestaurant(restaurant);
    }
  }, [restaurant, currentRestaurant, setCurrentRestaurant]);

  if (!restaurantId) {
    return <Navigate to="/dashboard/restaurants" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The restaurant you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-muted-foreground">
          Restaurant management dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.address || "Not set"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.phone || "Not set"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant.members?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Menu Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage categories and menu items
              </p>
            </div>

            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Table Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage tables and QR codes
              </p>
            </div>

            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Orders</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage orders
              </p>
            </div>

            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Team Members</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Invite and manage staff
              </p>
            </div>

            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Payments</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View payment history
              </p>
            </div>

            <div className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer">
              <h3 className="font-medium">Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Edit restaurant details
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
