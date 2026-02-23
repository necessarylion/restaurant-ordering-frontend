/**
 * Table Card Component
 * Displays table information in a card format with seats and zone info
 */

import type { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Delete01Icon,
  QrCodeIcon,
  CheckmarkCircle02Icon,
  TableRoundIcon,
  SeatSelectorIcon,
} from "@hugeicons/core-free-icons";

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
    <Card
      className="flex flex-col hover:shadow-md transition-shadow overflow-hidden"
      style={{
        borderLeftWidth: table.zone?.color ? "3px" : undefined,
        borderLeftColor: table.zone?.color || undefined,
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={TableRoundIcon}
                strokeWidth={2}
                className="size-5 text-muted-foreground"
              />
              <CardTitle className="text-lg">{table.table_number}</CardTitle>
              <Badge className={table.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}>
                {table.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={SeatSelectorIcon} strokeWidth={2} className="size-3.5" />
                {table.seats} seats
              </span>
            </div>
            {table.zone && (
              <div className="mt-1.5">
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
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="space-y-2">
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
