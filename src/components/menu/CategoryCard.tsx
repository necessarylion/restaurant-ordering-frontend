/**
 * Category Card Component
 * Displays category information in a card format
 */

import { useTranslation } from "react-i18next";
import type { Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Delete01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { getSortOrderOption } from "@/lib/sort-order";

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
  const { t } = useTranslation();
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow pt-0">
      {/* Category Image */}
      <div className="relative">
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
        <Badge
          variant={category.is_active ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {category.is_active ? t("common.active") : t("common.inactive")}
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-1.5">
              {category.name}
              <span className={getSortOrderOption(category.sort_order).color} title={getSortOrderOption(category.sort_order).label}>
                {getSortOrderOption(category.sort_order).icon}
              </span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4 mr-1" />
              {t("common.edit")}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category)}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-1" />
              {t("common.delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
