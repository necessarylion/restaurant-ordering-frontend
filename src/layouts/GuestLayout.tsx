/**
 * Guest Layout
 * Minimal layout for guest ordering (QR code scanning flow)
 * No authentication required
 */

import { Outlet } from "react-router-dom";
import { CartSummary } from "@/components/order/CartSummary";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "@/hooks/useTheme";

export const GuestLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Order Menu</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <HugeiconsIcon
              icon={theme === "dark" ? Sun02Icon : Moon02Icon}
              strokeWidth={2}
              className="size-5"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Floating Cart Summary */}
      <CartSummary />
    </div>
  );
};
