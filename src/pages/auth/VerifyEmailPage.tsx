/**
 * Verify Email Page
 * Handles email verification from link: /verify-email?token=xxx
 */

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const token = searchParams.get("token");
  const verifyAttempted = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("auth.invalidToken"));
      return;
    }

    // Prevent double-call in StrictMode
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setTimeout(() => {
          const { isAuthenticated } = useAuthStore.getState();
          navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
        }, 2000);
      } catch (err: unknown) {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : t("auth.verificationFailed"));
      }
    };

    verify();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-primary">
            <img src={logo} alt="Dine Q" className="size-8 rounded-full bg-primary border-none outline-none" />
            <span className="font-['Rammetto_One'] text-xl">DINE Q</span>
          </div>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-muted-foreground">{t("auth.verifyingEmail")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="size-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("auth.emailVerified")}</h1>
              <p className="text-muted-foreground">{t("auth.emailVerifiedDescription")}</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} className="size-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("auth.verificationFailed")}</h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/login">{t("auth.goToLogin")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
