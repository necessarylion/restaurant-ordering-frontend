import { useState } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Store01Icon,
  Menu01Icon,
  Grid02Icon,
  TableRoundIcon,
  ShoppingBasket01Icon,
  Calendar03Icon,
  ShutDownIcon,
  Sun02Icon,
  Restaurant01Icon,
  Moon02Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTheme } from "@/hooks/useTheme";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItem {
  to: string;
  label: string;
  icon: IconSvgElement;
  requiresRestaurant?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { to: "/dashboard/categories", label: "Categories", icon: Grid02Icon, requiresRestaurant: true },
  { to: "/dashboard/menu", label: "Menu Items", icon: Menu01Icon, requiresRestaurant: true },
  { to: "/dashboard/tables", label: "Tables", icon: TableRoundIcon, requiresRestaurant: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: Calendar03Icon, requiresRestaurant: true },
  { to: "/dashboard/orders", label: "Orders", icon: ShoppingBasket01Icon, requiresRestaurant: true },
  { to: "/dashboard/restaurants", label: "Restaurants", icon: Store01Icon },
];

const SIDEBAR_KEY = "sidebar_collapsed";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const { theme, toggleTheme } = useTheme();
  const { confirm } = useAlertDialog();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === "true"
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

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
    <aside
      className={`${collapsed ? "w-18" : "w-64"} shrink-0 border-r bg-card transition-all duration-300 overflow-hidden`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b p-4">
          {collapsed ? (
            <div className="flex items-center justify-center">
              <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={2} className="size-7 shrink-0" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={2} className="size-8 shrink-0" />
                <p className="text-lg whitespace-nowrap">Dine Q</p>
              </div>
              <button
                onClick={toggleCollapsed}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={2} className="size-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? "flex flex-col items-center gap-1 py-4" : "p-4 space-y-1"}`}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleCollapsed}
                  className="flex items-center justify-center size-10 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-all mb-1"
                >
                  <HugeiconsIcon icon={SidebarRight01Icon} strokeWidth={2} className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Main Menu
            </p>
          )}
          {visibleItems.map((item) =>
            collapsed ? (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className="flex items-center justify-center size-10 rounded-xl transition-all hover:bg-accent text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
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
                <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Footer */}
        <div className={`border-t ${collapsed ? "flex flex-col items-center gap-1 py-4" : "p-4"}`}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive hover:bg-accent size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <HugeiconsIcon icon={ShutDownIcon} strokeWidth={2} className="size-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent size-10 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={theme === "dark" ? Sun02Icon : Moon02Icon}
                      strokeWidth={2}
                      className="size-5"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Logout"
              >
                <HugeiconsIcon icon={ShutDownIcon} strokeWidth={2} className="size-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
          )}
        </div>
      </div>
    </aside>
  );
};
