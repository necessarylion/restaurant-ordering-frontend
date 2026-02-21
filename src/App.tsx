/**
 * Root Application Component
 * Sets up routing and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { CartProvider } from "@/contexts/CartContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialogProvider } from "@/contexts/AlertDialogContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { GuestLayout } from "@/layouts/GuestLayout";
import {
  publicRoutes,
  guestRoutes,
  dashboardRoutes,
  dashboardIndex,
  type RouteConfig,
} from "@/routes";

function renderRoutes(routes: RouteConfig[]) {
  return routes.map((route) =>
    "redirectTo" in route ? (
      <Route
        key={route.path}
        path={route.path}
        element={<Navigate to={route.redirectTo} replace />}
      />
    ) : (
      <Route
        key={route.path}
        path={route.path}
        element={<route.element />}
      />
    )
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <TooltipProvider>
            <AlertDialogProvider>
            <Routes>
              {renderRoutes(publicRoutes)}

              <Route path="/guest" element={<GuestLayout />}>
                {renderRoutes(guestRoutes)}
              </Route>

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to={dashboardIndex.redirectTo} replace />}
                />
                {renderRoutes(dashboardRoutes)}
              </Route>
            </Routes>
            </AlertDialogProvider>
            </TooltipProvider>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
