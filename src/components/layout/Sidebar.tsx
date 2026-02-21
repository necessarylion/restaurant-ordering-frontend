import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Store01Icon,
  Menu01Icon,
  Grid02Icon,
  Table01Icon,
  ShoppingBasket01Icon,
  Calendar03Icon,
  ShutDownIcon,
  Sun02Icon,
  Restaurant01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTheme } from "@/hooks/useTheme";
import { useAlertDialog } from "@/hooks/useAlertDialog";

interface SidebarItem {
  to: string;
  label: string;
  icon: IconSvgElement;
  requiresRestaurant?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { to: "/dashboard/categories", label: "Categories", icon: Grid02Icon, requiresRestaurant: true },
  { to: "/dashboard/menu", label: "Menu Items", icon: Menu01Icon, requiresRestaurant: true },
  { to: "/dashboard/tables", label: "Tables", icon: Table01Icon, requiresRestaurant: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: Calendar03Icon, requiresRestaurant: true },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBasket01Icon, requiresRestaurant: true },
  { to: "/dashboard/restaurants", label: "Restaurants", icon: Store01Icon },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const { theme, toggleTheme } = useTheme();
  const { confirm } = useAlertDialog();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Are you sure you want to logout?",
      description: "You will be redirected to the login page.",
      confirmLabel: "Logout",
    });
    if (!confirmed) return;
    await logout();
  };

  const visibleItems = sidebarItems.filter(
    (item) => !item.requiresRestaurant || currentRestaurant
  );

  return (
    <aside className="w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="flex items-center px-2">
            <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={2} className="size-8 mr-4" />
            <p className="text-lg w-full">Dine Q</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Main Menu
          </p>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                }`
              }
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Logout"
            >
              <HugeiconsIcon icon={ShutDownIcon} strokeWidth={2} className="size-5" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <HugeiconsIcon
                icon={theme === "dark" ? Sun02Icon : Moon02Icon}
                strokeWidth={2}
                className="size-5"
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
