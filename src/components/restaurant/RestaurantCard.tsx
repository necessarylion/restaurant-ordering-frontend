/**
 * Restaurant Card Component
 * Displays restaurant information in a card format
 */

import type { Restaurant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect?: (restaurant: Restaurant) => void;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (restaurant: Restaurant) => void;
  isSelected?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
  onEdit,
  onDelete,
  isSelected,
}) => {
  return (
    <Card className={isSelected ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {restaurant.name}
              {isSelected && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5 text-green-500" />}
            </CardTitle>
            {restaurant.address && (
              <p className="text-sm text-muted-foreground mt-1">
                {restaurant.address}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {restaurant.phone && (
            <div className="text-sm">
              <span className="text-muted-foreground">Phone: </span>
              <span>{restaurant.phone}</span>
            </div>
          )}

          {restaurant.members && restaurant.members.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Members: </span>
              <span>{restaurant.members.length}</span>
            </div>
          )}

          <div className="flex gap-2">
            {onSelect && (
              <Button
                onClick={() => onSelect(restaurant)}
                variant={isSelected ? "outline" : "default"}
                size="sm"
                className={isSelected ? "flex-1 cursor-not-allowed" : "flex-1 cursor-pointer"}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={() => onEdit(restaurant)}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                onClick={() => onDelete(restaurant)}
                variant="outline"
                size="sm"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
