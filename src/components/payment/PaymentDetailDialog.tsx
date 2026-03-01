/**
 * Payment Detail Dialog
 * Shows payment summary with associated orders in a modal
 */

import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { OrderCard } from "@/components/order/OrderCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TableRoundIcon,
  Calendar03Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";
import type { Payment } from "@/types";

interface PaymentDetailDialogProps {
  payment: Payment | null;
  onClose: () => void;
}

const formatPaymentNumber = (paymentId: number, createdAt: string) => {
  let normalized = createdAt;
  if (!/Z$/.test(createdAt) && !/[+-]\d{2}:\d{2}$/.test(createdAt)) {
    normalized = createdAt + "Z";
  }
  const date = new Date(normalized);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}-${paymentId}`;
};

const formatDateTime = (dateStr: string) => {
  let normalized = dateStr;
  if (!/Z$/.test(dateStr) && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
    normalized = dateStr + "Z";
  }
  const date = new Date(normalized);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const PaymentDetailDialog = ({
  payment,
  onClose,
}: PaymentDetailDialogProps) => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const currency = currentRestaurant?.currency || "USD";
  const restaurantName = currentRestaurant?.name || "";
  const orders = payment?.orders || [];

  const handlePrint = () => {
    if (!payment) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const num = formatPaymentNumber(payment.id, payment.created_at);
    const dateTime = formatDateTime(payment.created_at);
    const table = payment.table?.table_number || `#${payment.table_id}`;

    // Combine all order items into one list
    const allItems = orders.flatMap((order) => order.order_items || []);
    const itemsHtml = allItems
      .map(
        (item) =>
          `<tr><td>${item.quantity}x ${item.name || "Item"}</td><td class="r">${formatPrice(item.price * item.quantity, currency)}</td></tr>`
      )
      .join("");

    const discount =
      payment.discount > 0
        ? `<tr><td>${t("payment.discount")}</td><td class="r">-${formatPrice(payment.discount, currency)}</td></tr>`
        : "";

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>#${num}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;width:280px;margin:0 auto;padding:16px 0;font-size:11px;color:#000}
.center{text-align:center}
.name{font-size:14px;font-weight:bold;margin-bottom:2px}
.sep{border-top:1px dashed #000;margin:8px 0}
table{width:100%;border-collapse:collapse}
td{padding:2px 0;vertical-align:top}
.r{text-align:right;white-space:nowrap}
.sep-solid{border-top:1px solid #000;margin:6px 0}
.total td{font-weight:bold;font-size:13px;padding-top:4px}
.footer{margin-top:10px;font-size:10px}
@media print{@page{margin:0}body{padding:8px}}
</style></head>
<body>
<div class="center name">${restaurantName}</div>
<div class="center">${t("payment.table")}: ${table}</div>
<div class="sep"></div>
<div class="center" style="font-weight:bold">#${num}</div>
<div class="center" style="font-size:10px;color:#666">${dateTime}</div>
<div class="sep"></div>
<table>${itemsHtml}</table>
<div class="sep"></div>
<table>
<tr><td>${t("payment.subTotal")}</td><td class="r">${formatPrice(payment.price_before_discount, currency)}</td></tr>
${discount}
<tr class="total"><td colspan="2"><div class="sep-solid"></div></td></tr>
<tr class="total"><td>${t("payment.total")} <span style="font-weight:normal;font-size:10px">(${t("payment.vatIncluded")})</span></td><td class="r">${formatPrice(payment.total, currency)}</td></tr>
</table>
<div class="sep"></div>
<div class="center footer">Thank you!</div>
</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={!!payment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[85vh] overflow-y-auto">
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                #{formatPaymentNumber(payment.id, payment.created_at)}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Orders */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("payment.orders")} ({orders.length})
                </h3>

                {orders.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        showPrice
                        currency={currency}
                        className="cursor-default"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {t("order.noOrders")}
                  </p>
                )}
              </div>

              {/* Right: Payment Summary */}
              <div className="space-y-4">
                {/* Table */}
                <div className="flex items-center gap-2 text-sm mt-7">
                  <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("payment.table")}:</span>
                  <span className="font-medium">{payment.table?.table_number || `#${payment.table_id}`}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t("payment.date")}:</span>
                  <span className="font-medium">{formatDateTime(payment.created_at)}</span>
                </div>

                {/* Price breakdown */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("payment.subTotal")}</span>
                    <span>{formatPrice(payment.price_before_discount, currency)}</span>
                  </div>
                  {payment.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("payment.discount")}</span>
                      <span className="text-green-600 dark:text-green-400">-{formatPrice(payment.discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>{t("payment.total")} <span className="text-xs font-normal text-muted-foreground">({t("payment.vatIncluded")})</span></span>
                    <span className="text-yellow-500">{formatPrice(payment.total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handlePrint}>
                <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} className="size-4 mr-1" />
                {t("common.print")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
