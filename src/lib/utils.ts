import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price based on currency
 * @param price - Price value (not in cents, normal value)
 * @param currency - Currency code (e.g., "USD", "MMK")
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string): string {
  // Currency locale mapping
  const localeMap: Record<string, string> = {
    USD: "en-US",
    MMK: "my-MM",
    EUR: "de-DE",
    GBP: "en-GB",
  };

  const locale = localeMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(price);
}
