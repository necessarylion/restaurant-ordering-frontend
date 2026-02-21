import { create } from "zustand";
import type { Restaurant } from "@/types";

const RESTAURANT_KEY = "selected_restaurant_id";

interface RestaurantState {
  currentRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  isLoading: boolean;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  clearSelection: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  currentRestaurant: null,
  restaurants: [],
  isLoading: false,

  setCurrentRestaurant: (restaurant) => {
    set({ currentRestaurant: restaurant });
    if (restaurant) {
      localStorage.setItem(RESTAURANT_KEY, restaurant.id.toString());
    } else {
      localStorage.removeItem(RESTAURANT_KEY);
    }
  },

  setRestaurants: (restaurantList) => {
    set({ restaurants: restaurantList });

    if (restaurantList.length === 0) {
      set({ currentRestaurant: null });
      return;
    }

    // If current selection is still valid in new list, keep it
    const current = get().currentRestaurant;
    if (current && restaurantList.some((r) => r.id === current.id)) {
      return;
    }

    // If only one restaurant, auto-select it
    if (restaurantList.length === 1) {
      get().setCurrentRestaurant(restaurantList[0]);
      return;
    }

    // Try to restore previous selection from localStorage
    const savedId = localStorage.getItem(RESTAURANT_KEY);
    if (savedId) {
      const saved = restaurantList.find((r) => r.id.toString() === savedId);
      if (saved) {
        get().setCurrentRestaurant(saved);
        return;
      }
    }
  },

  clearSelection: () => {
    get().setCurrentRestaurant(null);
  },
}));
