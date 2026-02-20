/**
 * TableNode component for Konva canvas
 * Renders a draggable table card with top-down icon, seat count,
 * and a name label on the bottom border. Width scales with seat count.
 */

import { Group, Rect, Text, Circle } from "react-konva";
import type Konva from "konva";

export type TableStatus = "available" | "unavailable" | "booked";

interface TableNodeProps {
  id: number;
  tableNumber: string;
  x: number;
  y: number;
  seats: number;
  status: TableStatus;
  isSelected: boolean;
  onDragEnd: (id: number, x: number, y: number) => void;
  onClick: (id: number) => void;
}

const BASE_W = 90;
const PER_SEAT = 12;
const MIN_W = 90;
const MAX_W = 200;
const H = 110;
const R = 12;
const CIRCLE_D = 100; // diameter for small (≤2 seat) tables

function getWidth(seats: number) {
  return Math.min(MAX_W, Math.max(MIN_W, BASE_W + seats * PER_SEAT));
}

const STATUS: Record<
  TableStatus,
  { stroke: string; fill: string; text: string }
> = {
  available: {
    stroke: "#22c55e",
    fill: "rgba(34,197,94,0.08)",
    text: "#22c55e",
  },
  booked: {
    stroke: "#eab308",
    fill: "rgba(234,179,8,0.08)",
    text: "#eab308",
  },
  unavailable: {
    stroke: "#ef4444",
    fill: "rgba(239,68,68,0.08)",
    text: "#ef4444",
  },
};

/**
 * Top-down table icon with chairs distributed around the table surface.
 * Chair placement adapts to the actual seat count.
 */
function TableIcon({
  cx,
  cy,
  color,
  seats,
  tableW,
}: {
  cx: number;
  cy: number;
  color: string;
  seats: number;
  tableW: number;
}) {
  const chairR = 3;
  const gap = 3;

  // Circle table for ≤2 seats
  if (seats <= 2) {
    const tableRadius = 10;
    const chairDist = tableRadius + gap + chairR;
    const chairs: { x: number; y: number }[] = [];
    for (let i = 0; i < seats; i++) {
      const angle = (Math.PI * 2 * i) / seats - Math.PI / 2;
      chairs.push({
        x: cx + Math.cos(angle) * chairDist,
        y: cy + Math.sin(angle) * chairDist,
      });
    }
    return (
      <>
        <Circle
          x={cx}
          y={cy}
          radius={tableRadius}
          stroke={color}
          strokeWidth={1.5}
          fill="transparent"
        />
        {chairs.map((c, i) => (
          <Circle
            key={i}
            x={c.x}
            y={c.y}
            radius={chairR}
            stroke={color}
            strokeWidth={1.2}
          />
        ))}
      </>
    );
  }

  // Rectangular table surface for >2 seats
  const tw = Math.min(tableW * 0.4, 50);
  const th = 16;

  // Distribute seats: top, bottom, left, right
  const top = Math.ceil(seats / 4);
  const bottom = Math.ceil((seats - top) / 3);
  const left = Math.ceil((seats - top - bottom) / 2);
  const right = seats - top - bottom - left;

  const chairs: { x: number; y: number }[] = [];

  // Top chairs
  for (let i = 0; i < top; i++) {
    const spacing = tw / (top + 1);
    chairs.push({
      x: cx - tw / 2 + spacing * (i + 1),
      y: cy - th / 2 - gap - chairR,
    });
  }
  // Bottom chairs
  for (let i = 0; i < bottom; i++) {
    const spacing = tw / (bottom + 1);
    chairs.push({
      x: cx - tw / 2 + spacing * (i + 1),
      y: cy + th / 2 + gap + chairR,
    });
  }
  // Left chairs
  for (let i = 0; i < left; i++) {
    const spacing = th / (left + 1);
    chairs.push({
      x: cx - tw / 2 - gap - chairR,
      y: cy - th / 2 + spacing * (i + 1),
    });
  }
  // Right chairs
  for (let i = 0; i < right; i++) {
    const spacing = th / (right + 1);
    chairs.push({
      x: cx + tw / 2 + gap + chairR,
      y: cy - th / 2 + spacing * (i + 1),
    });
  }

  return (
    <>
      <Rect
        x={cx - tw / 2}
        y={cy - th / 2}
        width={tw}
        height={th}
        cornerRadius={4}
        stroke={color}
        strokeWidth={1.5}
        fill="transparent"
      />
      {chairs.map((c, i) => (
        <Circle
          key={i}
          x={c.x}
          y={c.y}
          radius={chairR}
          stroke={color}
          strokeWidth={1.2}
        />
      ))}
    </>
  );
}

export const TableNode = ({
  id,
  tableNumber,
  x,
  y,
  seats,
  status,
  isSelected,
  onDragEnd,
  onClick,
}: TableNodeProps) => {
  const isCircle = seats <= 2;
  const w = isCircle ? CIRCLE_D : getWidth(seats);
  const h = isCircle ? CIRCLE_D : H;
  const s = STATUS[status];
  const stroke = isSelected ? "#a78bfa" : s.stroke;
  const sw = isSelected ? 2.5 : 1.5;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(id, e.target.x(), e.target.y());
  };

  // Label dimensions
  const labelPadX = 10;
  const fontSize = 11;
  const labelW = Math.max(tableNumber.length * 7 + labelPadX * 2, 60);
  const labelH = 20;
  const labelX = (w - labelW) / 2;
  const labelY = h - labelH / 2;

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => onClick(id)}
      onTap={() => onClick(id)}
    >
      {/* Card */}
      {isCircle ? (
        <Circle
          x={w / 2}
          y={h / 2}
          radius={w / 2}
          fill={s.fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      ) : (
        <Rect
          width={w}
          height={h}
          fill={s.fill}
          stroke={stroke}
          strokeWidth={sw}
          cornerRadius={R}
        />
      )}

      {/* Top-down table + chairs icon */}
      <TableIcon
        cx={w / 2}
        cy={isCircle ? 30 : 32}
        color={s.text}
        seats={seats}
        tableW={w}
      />

      {/* Seats count */}
      <Text
        text={`${seats} Seats`}
        width={w}
        y={isCircle ? 52 : 60}
        align="center"
        fontSize={13}
        fontFamily="system-ui, sans-serif"
        fill={s.text}
      />

      {/* Name label bg — centered on bottom border */}
      <Rect
        x={labelX}
        y={labelY}
        width={labelW}
        height={labelH}
        fill="#111118"
        stroke={stroke}
        strokeWidth={sw}
        cornerRadius={5}
      />

      {/* Name label text */}
      <Text
        text={tableNumber}
        x={labelX}
        y={labelY + (labelH - fontSize) / 2}
        width={labelW}
        align="center"
        fontSize={fontSize}
        fontStyle="600"
        fontFamily="system-ui, sans-serif"
        fill={s.text}
      />
    </Group>
  );
};
