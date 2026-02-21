/**
 * Restaurant Card Component
 * Displays restaurant information in a card format
 */

import type { Restaurant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Store01Icon, Tick01Icon, PencilEdit01Icon, Delete01Icon } from "@hugeicons/core-free-icons";

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
    <Card className={`flex flex-col ${isSelected ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} className="size-full object-cover" />
            ) : (
              <HugeiconsIcon icon={Store01Icon} strokeWidth={1.5} className="size-6 text-muted-foreground" />
            )}
          </div>
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

      <CardContent className="mt-auto">
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
                disabled={isSelected}
                className="flex-1"
              >
                <HugeiconsIcon icon={isSelected ? CheckmarkCircle02Icon : Tick01Icon} strokeWidth={2} className="size-4" />
                {isSelected ? "Selected" : "Select"}
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={() => onEdit(restaurant)}
                variant="outline"
                size="sm"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                onClick={() => onDelete(restaurant)}
                variant="outline"
                size="sm"
              >
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
