/**
 * Guest Menu Page
 * Display restaurant menu for guest ordering via QR code
 */

import { useEffect, useState, useDeferredValue } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useGuestMenuItems } from "@/hooks/useMenuItems";
import { useGuestRestaurant } from "@/hooks/useRestaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuBrowser } from "@/components/order/MenuBrowser";
import type { MenuItem } from "@/types";


export const GuestMenuPage = () => {
  const { restaurantId: restaurantIdParam, token } = useParams<{
    restaurantId: string;
    token: string;
  }>();
  const { setTableToken, addItem, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const deferredKeyword = useDeferredValue(searchInput);

  const restaurantId = restaurantIdParam ? Number(restaurantIdParam) : null;

  // Initialize cart with restaurant ID and token
  useEffect(() => {
    if (token && restaurantId) {
      setTableToken(token, restaurantId);
    }
  }, [token, restaurantId, setTableToken]);

  const {
    data: restaurant,
    isLoading: restaurantLoading,
  } = useGuestRestaurant(restaurantId || undefined, token);

  const {
    data: menuItems = [],
    isLoading: menuItemsLoading,
  } = useGuestMenuItems(restaurantId || undefined, token, deferredKeyword || undefined);

  const currency = restaurant?.currency || "USD";

  const handleAddToCart = (menuItem: MenuItem) => {
    addItem(menuItem, 1);
  };

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please scan the QR code at your table to access the menu.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (restaurantLoading || menuItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <MenuBrowser
        menuItems={menuItems}
        categories={[]}
        currency={currency}
        onAddItem={handleAddToCart}
        getItemQuantity={(id) => items.find((i) => i.menu_item.id === id)?.quantity ?? 0}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
    </div>
  );
};
