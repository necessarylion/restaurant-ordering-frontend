/**
 * Payment List Page
 * Display payment history for a restaurant
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { usePayments, useDeletePayment } from "@/hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  TableRoundIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { formatPrice } from "@/lib/utils";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentDetailDialog } from "@/components/payment/PaymentDetailDialog";
import type { Payment } from "@/types";

export const PaymentListPage = () => {
  const { t } = useTranslation();
  const { currentRestaurant } = useRestaurant();
  const {
    data: payments = [],
    isLoading,
    error,
  } = usePayments(currentRestaurant?.id);
  const deleteMutation = useDeletePayment();
  const { confirm, alert: showAlert } = useAlertDialog();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

  const handleDelete = async (paymentId: number) => {
    if (!currentRestaurant) return;

    const confirmed = await confirm({
      title: t("payment.rollbackPayment"),
      description: t("payment.rollbackConfirm"),
      confirmLabel: t("payment.rollback"),
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({
        restaurantId: currentRestaurant.id,
        paymentId,
      });
    } catch (error: any) {
      await showAlert({
        title: t("common.error"),
        description: error.message || t("payment.failedToDelete"),
      });
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("common.noRestaurantSelected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("payment.selectRestaurant")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title={t("payment.errorLoading")}
        message={(error as any).message || t("payment.failedToLoad")}
      />
    );
  }

  const currency = currentRestaurant.currency || "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("payment.title")}
        description={t("payment.description", { name: currentRestaurant.name })}
      />

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("payment.noPayments")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">{t("payment.table")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("payment.subTotal")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("payment.tax")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("payment.discount")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("payment.total")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("payment.date")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("payment.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <td className="px-4 py-3 text-muted-foreground">{payment.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={TableRoundIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
                      {payment.table?.table_number || `#${payment.table_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatPrice(payment.sub_total, currency)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatPrice(payment.tax, currency)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {payment.discount > 0 ? `-${formatPrice(payment.discount, currency)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-yellow-500">
                    {formatPrice(payment.total, currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                      {formatDateTime(payment.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(payment.id); }}
                    >
                      <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-1" />
                      {t("payment.rollback")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentDetailDialog
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
};
