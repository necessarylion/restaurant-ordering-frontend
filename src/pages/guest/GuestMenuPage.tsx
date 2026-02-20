/**
 * Guest Menu Page
 * Display restaurant menu for guest ordering via QR code
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { MenuItem } from "@/types";
import { formatPrice } from "@/lib/utils";

export const GuestMenuPage = () => {
  const { restaurantId: restaurantIdParam, token } = useParams<{
    restaurantId: string;
    token: string;
  }>();
  const { setTableToken, addItem } = useCart();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const restaurantId = restaurantIdParam ? Number(restaurantIdParam) : null;

  // Initialize cart with restaurant ID and token
  useEffect(() => {
    if (token && restaurantId) {
      setTableToken(token, restaurantId);
    }
  }, [token, restaurantId, setTableToken]);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories(restaurantId || undefined);

  const {
    data: menuItems = [],
    isLoading: menuItemsLoading,
  } = useMenuItems(restaurantId || undefined);

  // Set restaurant in context when data loads
  useEffect(() => {
    const restaurant = menuItems[0]?.restaurant || categories[0]?.restaurant;
    if (restaurant) {
      setCurrentRestaurant(restaurant);
    }
  }, [menuItems, categories, setCurrentRestaurant]);

  const currency = currentRestaurant?.currency || "USD";

  const handleAddToCart = (menuItem: MenuItem) => {
    addItem(menuItem, 1);
  };

  const activeCategories = categories.filter((cat) => cat.is_active);
  const availableMenuItems = menuItems.filter((item) => item.is_available);

  const filteredMenuItems = selectedCategory
    ? availableMenuItems.filter((item) => item.category_id === selectedCategory)
    : availableMenuItems;

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

  if (categoriesLoading || menuItemsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Menu</h1>
        <p className="text-muted-foreground">
          Browse our menu and add items to your cart
        </p>
      </div>

      {/* Category Tabs */}
      {activeCategories.length > 0 && (
        <Tabs
          value={selectedCategory?.toString() || "all"}
          onValueChange={(value) =>
            setSelectedCategory(value === "all" ? null : Number(value))
          }
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {activeCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id.toString()}>
                {category.name}
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
              No menu items available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMenuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {/* Image */}
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0].image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">
                      {formatPrice(item.price, currency)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                    >
                      <HugeiconsIcon
                        icon={Add01Icon}
                        strokeWidth={2}
                        className="size-4 mr-1"
                      />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
