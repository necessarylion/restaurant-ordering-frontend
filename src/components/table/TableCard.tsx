/**
 * Table Card Component
 * Displays table information in a card format with seats and zone info
 */

import type { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Delete01Icon, QrCodeIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface TableCardProps {
  table: Table;
  onEdit?: (table: Table) => void;
  onDelete?: (table: Table) => void;
  onGenerateQR?: (table: Table) => void;
}

export const TableCard = ({
  table,
  onEdit,
  onDelete,
  onGenerateQR,
}: TableCardProps) => {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{table.table_number}</CardTitle>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {table.is_active ? (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5 text-green-500" />
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              <Badge variant="outline">{table.seats} seats</Badge>
              {table.zone && (
                <Badge
                  variant="outline"
                  style={
                    table.zone.color
                      ? { borderColor: table.zone.color, color: table.zone.color }
                      : undefined
                  }
                >
                  {table.zone.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="space-y-2">
          {/* Generate QR Code Button */}
          {onGenerateQR && table.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateQR(table)}
              className="w-full"
            >
              <HugeiconsIcon
                icon={QrCodeIcon}
                strokeWidth={2}
                className="size-4 mr-1"
              />
              Generate QR Code
            </Button>
          )}

          {/* Edit/Delete Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(table)}
                className="flex-1"
              >
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  strokeWidth={2}
                  className="size-4 mr-1"
                />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(table)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <HugeiconsIcon
                  icon={Delete01Icon}
                  strokeWidth={2}
                  className="size-4 mr-1"
                />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
