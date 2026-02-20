/**
 * Restaurant Context
 * Manages current restaurant selection and provides restaurant data
 */

import React, { createContext, useCallback, useRef, useState } from "react";
import type { Restaurant } from "@/types";

const RESTAURANT_KEY = "selected_restaurant_id";

interface RestaurantContextValue {
  currentRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  isLoading: boolean;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  clearSelection: () => void;
}

export const RestaurantContext = createContext<RestaurantContextValue | undefined>(
  undefined
);

interface RestaurantProviderProps {
  children: React.ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading] = useState(false);
  const currentRestaurantRef = useRef<Restaurant | null>(null);

  const setCurrentRestaurant = useCallback((restaurant: Restaurant | null) => {
    currentRestaurantRef.current = restaurant;
    setCurrentRestaurantState(restaurant);

    if (restaurant) {
      localStorage.setItem(RESTAURANT_KEY, restaurant.id.toString());
    } else {
      localStorage.removeItem(RESTAURANT_KEY);
    }
  }, []);

  const setRestaurantsWithAutoSelect = useCallback((restaurantList: Restaurant[]) => {
    setRestaurants(restaurantList);

    if (restaurantList.length === 0) {
      currentRestaurantRef.current = null;
      setCurrentRestaurantState(null);
      return;
    }

    // If current selection is still valid in new list, keep it
    const current = currentRestaurantRef.current;
    if (current && restaurantList.some((r) => r.id === current.id)) {
      return;
    }

    // If only one restaurant, auto-select it
    if (restaurantList.length === 1) {
      setCurrentRestaurant(restaurantList[0]);
      return;
    }

    // Try to restore previous selection from localStorage
    const savedId = localStorage.getItem(RESTAURANT_KEY);
    if (savedId) {
      const saved = restaurantList.find((r) => r.id.toString() === savedId);
      if (saved) {
        setCurrentRestaurant(saved);
        return;
      }
    }
  }, [setCurrentRestaurant]);

  /**
   * Clear restaurant selection
   */
  const clearSelection = useCallback(() => {
    setCurrentRestaurant(null);
  }, [setCurrentRestaurant]);

  const value: RestaurantContextValue = {
    currentRestaurant,
    restaurants,
    isLoading,
    setCurrentRestaurant,
    setRestaurants: setRestaurantsWithAutoSelect,
    clearSelection,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
