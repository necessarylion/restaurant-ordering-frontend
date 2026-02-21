/**
 * Root Application Component
 * Sets up routing and global providers
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialogRenderer } from "@/components/alert-dialog-renderer";
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
      <TooltipProvider>
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
        <AlertDialogRenderer />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
