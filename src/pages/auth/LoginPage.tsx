/**
 * Login Page
 * Allows users to login with email and password
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun02Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { loginSchema, type LoginFormData } from "@/schemas/auth_schema";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");

    try {
      await login(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.loginFailed"));
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
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

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Dine Q" className="size-10 rounded-full" />
          <span className="font-['Rammetto_One'] text-2xl">DINE Q</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Manage your restaurant,<br />effortlessly.
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Orders, tables, menus, and bookings — all in one place. Focus on what matters most: great food and happy guests.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Dine Q
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex items-center gap-2 text-primary">
              <img src={logo} alt="Dine Q" className="size-8 rounded-full bg-primary border-none outline-none" />
              <span className="font-['Rammetto_One'] text-xl">DINE Q</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">{t("auth.restaurantOrdering")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("auth.signInSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="email">{t("auth.email")}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
