/**
 * Category Card Component
 * Displays category information in a card format
 */

import type { Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, Delete02Icon, Image01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow pt-0">
      {/* Category Image */}
      {category.image ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-12 text-muted-foreground/30" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              {category.is_active ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5 text-green-500" />
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Sort Order: {category.sort_order}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1"
            >
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category)}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
