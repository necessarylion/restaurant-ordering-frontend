/**
 * Verify Email Notice Page
 * Shows "check your email" message with resend option
 */

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Sun02Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export const VerifyEmailNoticePage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, resendVerification, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  // Show spinner while loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Already verified → go to dashboard
  if (user.email_verified_at) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleResend = async () => {
    setResending(true);
    setError("");
    setResent(false);

    try {
      await resendVerification();
      setResent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.resendFailed"));
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title={theme === "dark" ? t("sidebar.switchToLight") : t("sidebar.switchToDark")}
      >
        <HugeiconsIcon
          icon={theme === "dark" ? Sun02Icon : Moon02Icon}
          size={20}
        />
      </button>

      <div className="w-full max-w-md space-y-6 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-primary">
            <img src={logo} alt="Dine Q" className="size-8 rounded-full bg-primary border-none outline-none" />
            <span className="font-['Rammetto_One'] text-xl">DINE Q</span>
          </div>
        </div>

        {/* Mail icon */}
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="size-8 text-primary" />
          </div>
        </div>

        {/* Title & description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("auth.verifyEmailTitle")}</h1>
          <p className="text-muted-foreground">
            <Trans i18nKey="auth.verifyEmailDescription" values={{ email: user.email }} components={{ strong: <strong className="font-semibold text-foreground" /> }} />
          </p>
        </div>

        {/* Status messages */}
        {resent && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            {t("auth.emailResent")}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending}
            className="w-full"
          >
            {resending ? t("auth.resendingEmail") : t("auth.resendEmail")}
          </Button>

          <p className="text-xs text-muted-foreground">
            {t("auth.checkSpam")}
          </p>

          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("sidebar.logout")}
          </button>
        </div>
      </div>
    </div>
  );
};
