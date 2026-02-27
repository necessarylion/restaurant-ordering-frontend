/**
 * Register Page
 * Allows new users to create an account
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/schemas/auth_schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");

    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || t("auth.registrationFailed"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("auth.createAccount")}</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.createAccountSubtitle")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="name">{t("auth.fullName")}</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder={t("auth.fullNamePlaceholder")}
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

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
              <p className="text-xs text-muted-foreground mt-1">
                {t("auth.passwordHint")}
              </p>
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
