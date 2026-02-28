/**
 * Route configuration arrays
 * Add new routes here instead of modifying App.tsx directly.
 */

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
import { PaymentListPage } from "@/pages/payments/PaymentListPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { MemberListPage } from "@/pages/members/MemberListPage";
import { InvitationListPage } from "@/pages/invitations/InvitationListPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { VerifyEmailNoticePage } from "@/pages/auth/VerifyEmailNoticePage";

interface PageRoute {
  path: string;
  element: React.ComponentType;
}

interface RedirectRoute {
  path: string;
  redirectTo: string;
}

export type RouteConfig = PageRoute | RedirectRoute;

export const publicRoutes: RouteConfig[] = [
  { path: "/", redirectTo: "/dashboard/restaurants" },
  { path: "/login", element: LoginPage },
  { path: "/register", element: RegisterPage },
  { path: "/verify-email", element: VerifyEmailPage },
  { path: "/verify-email-notice", element: VerifyEmailNoticePage },
  { path: "*", redirectTo: "/dashboard/restaurants" },
];

export const guestRoutes: PageRoute[] = [
  { path: ":restaurantId/:token", element: GuestMenuPage },
];

export const dashboardRoutes: RouteConfig[] = [
  { path: "overview", element: DashboardPage },
  { path: "restaurants", element: RestaurantListPage },
  { path: "categories", element: CategoryManagePage },
  { path: "menu", element: MenuPage },
  { path: "tables", element: TableListPage },
  { path: "bookings", element: BookingListPage },
  { path: "orders", element: OrderListPage },
  { path: "orders/create", element: StaffOrderCreatePage },
  { path: "payments", element: PaymentListPage },
  { path: "members", element: MemberListPage },
  { path: "invitations", element: InvitationListPage },
  { path: "settings", element: SettingsPage },
];

export const dashboardIndex: RedirectRoute = {
  path: "",
  redirectTo: "/dashboard/restaurants",
};
