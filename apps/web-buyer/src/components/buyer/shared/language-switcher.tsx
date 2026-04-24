"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { cn } from "@ba33/ui-web/cn";

type LanguageOption = {
  code: "fr" | "ar" | "en";
  label: string;
  dir: "ltr" | "rtl";
  flag: string;
};

const languageOptions: LanguageOption[] = [
  { code: "fr", label: "Francais", dir: "ltr", flag: "🇫🇷" },
  { code: "ar", label: "العربية", dir: "rtl", flag: "🇸🇦" },
  { code: "en", label: "English", dir: "ltr", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeCode, setActiveCode] = useState<LanguageOption["code"]>("fr");

  useEffect(() => {
    const activeLanguage = languageOptions.find((language) => language.code === activeCode);

    if (!activeLanguage) {
      return;
    }

    document.documentElement.lang = activeLanguage.code;
    document.documentElement.dir = activeLanguage.dir;
  }, [activeCode]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Changer la langue"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen((value) => !value)}
      >
        <Languages className="h-4 w-4" />
        <span>{languageOptions.find((language) => language.code === activeCode)?.flag}</span>
      </button>

      <div
        className={cn(
          "absolute right-0 top-12 z-50 min-w-44 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-md",
          open ? "block" : "hidden"
        )}
      >
        {languageOptions.map((language) => (
          <button
            key={language.code}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              activeCode === language.code && "bg-accent text-accent-foreground"
            )}
            onClick={() => {
              setActiveCode(language.code);
              setOpen(false);
            }}
          >
            <span>{language.flag}</span>
            <span>{language.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
