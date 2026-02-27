import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export const AcceptInvitationPage = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("invitation.invalidLink"));
      return;
    }

    const acceptInvitation = async () => {
      try {
        await api.post(endpoints.members.acceptInvitation(token));
        setStatus("success");
        setMessage(t("invitation.joinedSuccess"));
      } catch (err: unknown) {
        setStatus("error");
        const error = err as { response?: { data?: { error?: string } } };
        setMessage(error.response?.data?.error || t("invitation.failedToAccept"));
      }
    };

    acceptInvitation();
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center text-center py-10 gap-4">
          {status === "loading" && (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="size-12 animate-spin text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">{t("invitation.acceptingInvitation")}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-8 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <p className="text-base font-semibold">{t("invitation.invitationAccepted")}</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Button asChild className="mt-2">
                <Link to="/dashboard/restaurants">{t("invitation.goToDashboard")}</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="size-8 text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <p className="text-base font-semibold">{t("common.somethingWentWrong")}</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/dashboard/restaurants">{t("invitation.goToDashboard")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
