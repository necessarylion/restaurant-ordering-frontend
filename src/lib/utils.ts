import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a datetime-local input value to UTC RFC3339.
 * e.g. "2026-02-20T23:00" (in UTC+7) → "2026-02-20T16:00:00Z"
 */
export function toRFC3339(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Convert a UTC/RFC3339 datetime string to a datetime-local input value (local time).
 * e.g. "2026-02-20T16:00:00Z" (in UTC+7) → "2026-02-20T23:00"
 */
export function toDatetimeLocal(utcStr: string): string {
  const d = new Date(utcStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Format price based on currency
 * @param price - Price value (not in cents, normal value)
 * @param currency - Currency code (e.g., "USD", "MMK")
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string): string {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).formatToParts(price);

  return parts
    .map((p) => (p.type === "literal" && p.value.trim() === "" ? " " : p.value))
    .join("")
    .replace(/^([^\d]+?)(\d)/, "$1 $2");
}
