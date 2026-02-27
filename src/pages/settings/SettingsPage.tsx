import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

const languages = [
  { code: "en", label: "settings.english", flag: "🇺🇸" },
  { code: "my", label: "settings.burmese", flag: "🇲🇲" },
  { code: "de", label: "settings.german", flag: "🇩🇪" },
];

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.language")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("settings.languageDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent ${
                  i18n.language === lang.code
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium flex-1 text-left">
                  {t(lang.label)}
                </span>
                {i18n.language === lang.code && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="size-5 text-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
