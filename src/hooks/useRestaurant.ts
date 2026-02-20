/**
 * useRestaurant hook
 * Consumes RestaurantContext and provides restaurant state
 */

import { useContext } from "react";
import { RestaurantContext } from "@/contexts/RestaurantContext";

/**
 * Access restaurant selection state
 * @throws Error if used outside RestaurantProvider
 */
export const useRestaurant = () => {
  const context = useContext(RestaurantContext);

  if (context === undefined) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }

  return context;
};
