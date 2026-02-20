/**
 * Root Application Component
 * Sets up routing and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { CartProvider } from "@/contexts/CartContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { GuestLayout } from "@/layouts/GuestLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RestaurantListPage } from "@/pages/restaurants/RestaurantListPage";
import { CategoryManagePage } from "@/pages/menu/CategoryManagePage";
import { MenuPage } from "@/pages/menu/MenuPage";
import { TableListPage } from "@/pages/table/TableListPage";
import { GuestMenuPage } from "@/pages/guest/GuestMenuPage";
import { OrderListPage } from "@/pages/orders/OrderListPage";
import { StaffOrderCreatePage } from "@/pages/orders/StaffOrderCreatePage";
import { BookingListPage } from "@/pages/bookings/BookingListPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <TooltipProvider>
            <Routes>
              {/* Redirect root to restaurants */}
              <Route path="/" element={<Navigate to="/dashboard/restaurants" replace />} />

              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Guest ordering routes (no auth required) */}
              <Route path="/guest" element={<GuestLayout />}>
                <Route path=":restaurantId/:token" element={<GuestMenuPage />} />
              </Route>

              {/* Protected routes with dashboard layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Redirect /dashboard to /dashboard/restaurants */}
                <Route index element={<Navigate to="/dashboard/restaurants" replace />} />

                {/* Restaurant routes */}
                <Route path="restaurants" element={<RestaurantListPage />} />
                {/* Menu routes */}
                <Route path="categories" element={<CategoryManagePage />} />
                <Route path="menu" element={<MenuPage />} />

                {/* Table routes */}
                <Route path="tables" element={<TableListPage />} />

                {/* Booking routes */}
                <Route path="bookings" element={<BookingListPage />} />

                {/* Order routes */}
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/create" element={<StaffOrderCreatePage />} />
              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/dashboard/restaurants" replace />} />
            </Routes>
            </TooltipProvider>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;