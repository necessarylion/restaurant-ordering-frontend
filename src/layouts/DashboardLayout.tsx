/**
 * Dashboard Layout
 * Main layout with sidebar navigation for authenticated users
 */

import { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRestaurants } from "@/hooks/useRestaurants";
import { RestaurantSelector } from "@/components/restaurant/RestaurantSelector";
import { useTheme } from "@/hooks/useTheme";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon, Menu01Icon, Grid02Icon, Table01Icon, ShoppingBasket01Icon, Calendar03Icon, ShutDownIcon, Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentRestaurant, setRestaurants } = useRestaurant();
  const { data: restaurants = [] } = useRestaurants();

  // Sync restaurants to context whenever data loads (handles page refresh)
  useEffect(() => {
    if (restaurants.length > 0) {
      setRestaurants(restaurants);
    }
  }, [restaurants, setRestaurants]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-muted/50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">

          {/* Restaurant Selector */}
          {restaurants.length > 0 && (
            <div className="border-b p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Current Restaurant
              </p>
              <RestaurantSelector />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Main Menu
            </p>
            <NavLink
              to="/dashboard/restaurants"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                }`
              }
            >
              <HugeiconsIcon icon={Store01Icon} strokeWidth={2} className="size-4" />
              Restaurants
            </NavLink>

            {currentRestaurant && (
              <>
                <NavLink
                  to="/dashboard/categories"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={2} className="size-4" />
                  Categories
                </NavLink>

                <NavLink
                  to="/dashboard/menu"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-4" />
                  Menu Items
                </NavLink>

                <NavLink
                  to="/dashboard/tables"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <HugeiconsIcon icon={Table01Icon} strokeWidth={2} className="size-4" />
                  Tables
                </NavLink>

                <NavLink
                  to="/dashboard/bookings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                  Bookings
                </NavLink>

                <NavLink
                  to="/dashboard/orders"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`
                  }
                >
                  <HugeiconsIcon icon={ShoppingBasket01Icon} strokeWidth={2} className="size-4" />
                  Orders
                </NavLink>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Logout"
              >
                <HugeiconsIcon icon={ShutDownIcon} strokeWidth={2} className="size-5" />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <HugeiconsIcon icon={theme === "dark" ? Sun02Icon : Moon02Icon} strokeWidth={2} className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/50 p-8">
        <div>
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
