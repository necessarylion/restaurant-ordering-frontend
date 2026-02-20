/**
 * Guest Layout
 * Minimal layout for guest ordering (QR code scanning flow)
 * No authentication required
 */

import { Outlet } from "react-router-dom";
import { CartSummary } from "@/components/order/CartSummary";

export const GuestLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Simple Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Order Menu</h1>
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
