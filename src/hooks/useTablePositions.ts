/**
 * useTablePositions hook
 * Manages local position overrides for floor plan drag operations.
 * Positions are sourced from API (table.position_x, table.position_y) and
 * can be temporarily overridden during drag. Call saveFloorPlan to persist.
 */

import { useState, useCallback } from "react";
import type { Table } from "@/types";

interface PositionOverride {
  x: number;
  y: number;
}

export function useTablePositions(tables: Table[]) {
  const [overrides, setOverrides] = useState<Record<number, PositionOverride>>(
    {}
  );

  const getPosition = useCallback(
    (table: Table) => {
      const override = overrides[table.id];
      return {
        x: override?.x ?? table.position_x,
        y: override?.y ?? table.position_y,
      };
    },
    [overrides]
  );

  const updatePosition = useCallback((tableId: number, x: number, y: number) => {
    setOverrides((prev) => ({
      ...prev,
      [tableId]: { x, y },
    }));
  }, []);

  const hasChanges = Object.keys(overrides).length > 0;

  const getFloorPlanData = useCallback(() => {
    return tables.map((table) => {
      const override = overrides[table.id];
      return {
        id: table.id,
        x: override?.x ?? table.position_x,
        y: override?.y ?? table.position_y,
      };
    });
  }, [tables, overrides]);

  const clearOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  return {
    getPosition,
    updatePosition,
    hasChanges,
    getFloorPlanData,
    clearOverrides,
  };
}
