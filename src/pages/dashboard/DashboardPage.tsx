/**
 * Dashboard Page
 * Analytics overview with KPI cards, charts, and insights
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useDashboard } from "@/hooks/useDashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorCard } from "@/components/ErrorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBasket01Icon,
  Money01Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  Loading03Icon,
  BarChartIcon,
  Chart02Icon,
  Wallet01Icon,
  TaxesIcon,
  Discount01Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";

const PRESET_RANGES = [
  { label: "common.today", getDates: () => ({ from: new Date(), to: new Date() }) },
  { label: "dashboard.last7days", getDates: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "dashboard.last30days", getDates: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "dashboard.thisMonth", getDates: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "dashboard.lastMonth", getDates: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready: "#06b6d4",
  completed: "#22c55e",
  cancelled: "#ef4444",
  no_show: "#6b7280",
};

const ORDER_TYPE_COLORS: Record<string, string> = {
  dine_in: "#6366f1",
  takeaway: "#f97316",
  delivery: "#06b6d4",
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const [activePreset, setActivePreset] = useState(2); // Last 30 days default
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const currency = currentRestaurant?.currency || "USD";

  const dateFrom = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const { data, isLoading, error } = useDashboard(currentRestaurant?.id, dateFrom, dateTo);

  const handlePreset = (index: number) => {
    setActivePreset(index);
    const { from, to } = PRESET_RANGES[index].getDates();
    setDateRange({ from, to });
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setActivePreset(-1);
      if (range.from && range.to) {
        setCalendarOpen(false);
      }
    }
  };

  const dateLabel = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
      : format(dateRange.from, "MMM dd, yyyy")
    : t("dashboard.pickDateRange");

  // Chart data
  const dailyChartData = useMemo(() => {
    if (!data?.daily_orders) return [];
    return data.daily_orders.map((d) => ({
      date: format(new Date(d.date), "MMM dd"),
      orders: d.order_count,
      revenue: d.revenue,
    }));
  }, [data?.daily_orders]);

  const orderStatusData = useMemo(() => {
    if (!data?.orders?.by_status) return [];
    return Object.entries(data.orders.by_status)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        fill: STATUS_COLORS[key] || "#8884d8",
      }));
  }, [data?.orders?.by_status]);

  const orderTypeData = useMemo(() => {
    if (!data?.orders?.by_order_type) return [];
    return Object.entries(data.orders.by_order_type)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        fill: ORDER_TYPE_COLORS[key] || "#8884d8",
      }));
  }, [data?.orders?.by_order_type]);

  const bookingStatusData = useMemo(() => {
    if (!data?.bookings?.by_status) return [];
    return Object.entries(data.bookings.by_status)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        fill: STATUS_COLORS[key] || "#8884d8",
      }));
  }, [data?.bookings?.by_status]);

  if (!currentRestaurant) {
    return <ErrorCard title={t("common.noRestaurant")} message={t("common.selectRestaurantFirst")} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboard.title")} />

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_RANGES.map((preset, i) => (
          <Button
            key={preset.label}
            variant={activePreset === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(i)}
          >
            {t(preset.label)}
          </Button>
        ))}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto gap-2">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              defaultMonth={dateRange.from}
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <ErrorCard title={t("dashboard.failedToLoad")} message={(error as Error).message} />
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title={t("dashboard.totalOrders")}
              value={data.orders.total_count.toString()}
              icon={ShoppingBasket01Icon}
              color="text-indigo-500"
              bgColor="bg-indigo-500/10"
            />
            <KpiCard
              title={t("dashboard.revenue")}
              value={formatPrice(data.revenue.total_revenue, currency)}
              icon={Money01Icon}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <KpiCard
              title={t("dashboard.avgOrderValue")}
              value={formatPrice(data.revenue.average_order_value, currency)}
              icon={Chart02Icon}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <KpiCard
              title={t("dashboard.bookings")}
              value={data.bookings.total_count.toString()}
              icon={Calendar03Icon}
              color="text-cyan-500"
              bgColor="bg-cyan-500/10"
            />
          </div>

          {/* Revenue Detail Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title={t("dashboard.netRevenue")}
              value={formatPrice(data.revenue.net_revenue, currency)}
              icon={Wallet01Icon}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
            <KpiCard
              title={t("dashboard.totalTax")}
              value={formatPrice(data.revenue.total_tax, currency)}
              icon={TaxesIcon}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
            />
            <KpiCard
              title={t("dashboard.totalDiscount")}
              value={formatPrice(data.revenue.total_discount, currency)}
              icon={Discount01Icon}
              color="text-pink-500"
              bgColor="bg-pink-500/10"
            />
            <KpiCard
              title={t("dashboard.payments")}
              value={data.revenue.payment_count.toString()}
              icon={CreditCardIcon}
              color="text-violet-500"
              bgColor="bg-violet-500/10"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily Orders & Revenue Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <HugeiconsIcon icon={BarChartIcon} strokeWidth={2} className="size-4" />
                  {t("dashboard.dailyTrends")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" fontSize={12} className="fill-muted-foreground" />
                      <YAxis yAxisId="left" fontSize={12} className="fill-muted-foreground" />
                      <YAxis yAxisId="right" orientation="right" fontSize={12} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar yAxisId="left" dataKey="orders" name={t("dashboard.orders")} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name={t("dashboard.revenue")} stroke="#22c55e" strokeWidth={2} dot={false} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                    {t("dashboard.noDataForPeriod")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.orderStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                    {t("dashboard.noOrderData")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Popular Items */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dashboard.popularItems")}</CardTitle>
              </CardHeader>
              <CardContent>
                {data.popular_items && data.popular_items.length > 0 ? (
                  <div className="space-y-3">
                    {data.popular_items.map((item, index) => (
                      <div key={item.menu_item_id} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center size-8 rounded-full text-sm font-bold ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                          index === 1 ? "bg-gray-300/20 text-gray-500" :
                          index === 2 ? "bg-amber-700/20 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("dashboard.soldAcrossOrders", { quantity: item.total_quantity, count: item.order_count })}
                          </p>
                        </div>
                        <span className="font-semibold text-yellow-500">
                          {formatPrice(item.total_revenue, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    {t("dashboard.noPopularItems")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Types + Booking + Members */}
            <div className="space-y-4">
              {/* Order Types */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("dashboard.orderTypes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderTypeData.length > 0 ? (
                    <div className="space-y-2">
                      {orderTypeData.map((item) => {
                        const total = data.orders.total_count || 1;
                        const pct = Math.round((item.value / total) * 100);
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">{item.value} ({pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: item.fill }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Booking Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("dashboard.bookings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingStatusData.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {bookingStatusData.map((item) => (
                        <Badge key={item.name} variant="secondary" className="text-xs" style={{ borderColor: item.fill, borderWidth: 1 }}>
                          {item.name}: {item.value}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.noBookingData")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Members */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HugeiconsIcon icon={UserMultiple02Icon} strokeWidth={2} className="size-4" />
                    {t("dashboard.team")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{data.members.total}</span>
                    <span className="text-sm text-muted-foreground">{t("dashboard.members")}</span>
                  </div>
                  {data.members.by_role && Object.keys(data.members.by_role).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(data.members.by_role).map(([role, count]) => (
                        <Badge key={role} variant="outline" className="text-xs capitalize">
                          {role}: {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

// KPI Card component
function KpiCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center size-12 rounded-xl ${bgColor}`}>
            <HugeiconsIcon icon={icon} strokeWidth={2} className={`size-6 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold truncate">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}