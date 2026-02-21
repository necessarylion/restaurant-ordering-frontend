/**
 * Dashboard Layout
 * Main layout with sidebar navigation for authenticated users
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Sidebar } from "@/components/layout/Sidebar";

export const DashboardLayout = () => {
  const { setRestaurants } = useRestaurant();
  const { data: restaurants = [] } = useRestaurants();

  // Sync restaurants to store whenever data loads (handles page refresh)
  useEffect(() => {
    if (restaurants.length > 0) {
      setRestaurants(restaurants);
    }
  }, [restaurants, setRestaurants]);

  return (
    <div className="flex h-screen bg-muted/50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-0 bg-muted/50">
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
