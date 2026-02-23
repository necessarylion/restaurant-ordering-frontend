/**
 * Dashboard Page
 * Analytics overview with KPI cards, charts, and insights
 */

import { useState, useMemo } from "react";
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
  { label: "Today", getDates: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", getDates: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: "Last 30 days", getDates: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: "This Month", getDates: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last Month", getDates: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
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
    : "Pick a date range";

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
    return <ErrorCard title="No Restaurant" message="Please select a restaurant first." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_RANGES.map((preset, i) => (
          <Button
            key={preset.label}
            variant={activePreset === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(i)}
          >
            {preset.label}
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
        <ErrorCard title="Failed to load dashboard" message={(error as Error).message} />
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Orders"
              value={data.orders.total_count.toString()}
              icon={ShoppingBasket01Icon}
              color="text-indigo-500"
              bgColor="bg-indigo-500/10"
            />
            <KpiCard
              title="Revenue"
              value={formatPrice(data.revenue.total_revenue, currency)}
              icon={Money01Icon}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <KpiCard
              title="Avg Order Value"
              value={formatPrice(data.revenue.average_order_value, currency)}
              icon={Chart02Icon}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <KpiCard
              title="Bookings"
              value={data.bookings.total_count.toString()}
              icon={Calendar03Icon}
              color="text-cyan-500"
              bgColor="bg-cyan-500/10"
            />
          </div>

          {/* Revenue Detail Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Net Revenue"
              value={formatPrice(data.revenue.net_revenue, currency)}
              icon={Wallet01Icon}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
            <KpiCard
              title="Total Tax"
              value={formatPrice(data.revenue.total_tax, currency)}
              icon={TaxesIcon}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
            />
            <KpiCard
              title="Total Discount"
              value={formatPrice(data.revenue.total_discount, currency)}
              icon={Discount01Icon}
              color="text-pink-500"
              bgColor="bg-pink-500/10"
            />
            <KpiCard
              title="Payments"
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
                  Daily Trends
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
                      <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                    No data for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Status</CardTitle>
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
                    No order data
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
                <CardTitle className="text-base">Popular Items</CardTitle>
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
                            {item.total_quantity} sold across {item.order_count} orders
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
                    No popular items data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Types + Booking + Members */}
            <div className="space-y-4">
              {/* Order Types */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Order Types</CardTitle>
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
                    <p className="text-sm text-muted-foreground text-center py-4">No data</p>
                  )}
                </CardContent>
              </Card>

              {/* Booking Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Bookings</CardTitle>
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
                    <p className="text-sm text-muted-foreground text-center py-4">No booking data</p>
                  )}
                </CardContent>
              </Card>

              {/* Members */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HugeiconsIcon icon={UserMultiple02Icon} strokeWidth={2} className="size-4" />
                    Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{data.members.total}</span>
                    <span className="text-sm text-muted-foreground">members</span>
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