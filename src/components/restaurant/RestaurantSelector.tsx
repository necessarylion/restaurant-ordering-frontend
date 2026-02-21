/**
 * Restaurant Selector Component
 * Dropdown to switch between restaurants
 */

import { useRestaurant } from "@/hooks/useRestaurant";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const RestaurantSelector = () => {
  const { currentRestaurant, restaurants, setCurrentRestaurant } = useRestaurant();

  if (restaurants.length === 0) {
    return null;
  }

  if (restaurants.length === 1) {
    return (
      <div className="text-sm font-medium">
        {restaurants[0].name}
      </div>
    );
  }

  return (
    <Select
      value={currentRestaurant?.id.toString() || ""}
      onValueChange={(value) => {
        const selected = restaurants.find((r) => r.id.toString() === value);
        if (selected) {
          setCurrentRestaurant(selected);
        }
      }}
    >
      <SelectTrigger className="w-full cursor-pointer">
        <SelectValue placeholder="Select restaurant" />
      </SelectTrigger>
      <SelectContent>
        {restaurants.map((restaurant) => (
          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
            {restaurant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
