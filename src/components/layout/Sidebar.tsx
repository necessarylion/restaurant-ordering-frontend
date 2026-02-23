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
  DashboardSpeed01Icon,
  ShutDownIcon,
  Sun02Icon,
  Restaurant01Icon,
  Moon02Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  UserGroupIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useTheme } from "@/hooks/useTheme";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { useInvitations } from "@/hooks/useInvitations";
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

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    label: "Main Menu",
    items: [
      { to: "/dashboard/overview", label: "Dashboard", icon: DashboardSpeed01Icon, requiresRestaurant: true },
      { to: "/dashboard/tables", label: "Tables", icon: TableRoundIcon, requiresRestaurant: true },
      { to: "/dashboard/categories", label: "Categories", icon: Grid02Icon, requiresRestaurant: true },
      { to: "/dashboard/menu", label: "Menu Items", icon: Menu01Icon, requiresRestaurant: true },
      { to: "/dashboard/bookings", label: "Bookings", icon: Calendar03Icon, requiresRestaurant: true },
      { to: "/dashboard/orders", label: "Orders", icon: ShoppingBasket01Icon, requiresRestaurant: true },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/dashboard/restaurants", label: "Restaurants", icon: Store01Icon },
      { to: "/dashboard/members", label: "Members", icon: UserGroupIcon, requiresRestaurant: true },
    ],
  },
];

const SIDEBAR_KEY = "sidebar_collapsed";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const { theme, toggleTheme } = useTheme();
  const { confirm } = useAlertDialog();
  const { data: invitations } = useInvitations();
  const invitationCount = invitations?.length ?? 0;
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

  const getVisibleItems = (items: SidebarItem[]) =>
    items.filter((item) => !item.requiresRestaurant || currentRestaurant);

  const renderNavItem = (item: SidebarItem) =>
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
    );

  return (
    <aside
      className={`${collapsed ? "w-18" : "w-64"} relative shrink-0 border-r bg-card transition-all duration-300 overflow-visible`}
    >
      {/* Toggle button on border edge */}
      <button
        onClick={toggleCollapsed}
        className="absolute top-5 -right-3 z-10 flex size-6 items-center justify-center rounded-full border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shadow-sm"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <HugeiconsIcon icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon} strokeWidth={2} className="size-3.5" />
      </button>

      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          {collapsed ? (
            <div className="flex items-center justify-center">
              <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={2} className="size-7 shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={2} className="size-8 shrink-0 ml-3" />
              <p className="text-xl whitespace-nowrap ml-3" style={{ fontFamily: "'Rammetto One', cursive" }}>DINE Q</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${collapsed ? "flex flex-col items-center gap-1 py-4" : "p-4 space-y-1"}`}>
          {invitationCount > 0 && (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/dashboard/invitations"
                    className="relative flex items-center justify-center size-10 rounded-xl transition-all hover:bg-accent text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
                  >
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-5" />
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {invitationCount}
                    </span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Invitations ({invitationCount})</TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                to="/dashboard/invitations"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent mb-2 ${
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  }`
                }
              >
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4 shrink-0" />
                <span className="whitespace-nowrap flex-1">Invitations</span>
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {invitationCount}
                </span>
              </NavLink>
            )
          )}
          {sidebarSections.map((section) => {
            const visibleItems = getVisibleItems(section.items);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                {!collapsed && (
                  <p className="text-xs font-medium text-muted-foreground mb-2 mt-4 first:mt-0">
                    {section.label}
                  </p>
                )}
                {collapsed && section.label === "Settings" && (
                  <div className="w-8 border-t my-2" />
                )}
                {visibleItems.map(renderNavItem)}
              </div>
            );
          })}
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
