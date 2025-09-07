"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/ui/locale-provider";

// Translation data structure
interface TranslationData {
  [key: string]: any;
}

// Cache for translations
const translationCache: Record<string, TranslationData> = {};

export function useTranslation() {
  const router = useRouter();
  const { currentLocale } = useLocale();
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations from JSON files
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [arTranslations, enTranslations] = await Promise.all([
          import("../public/locales/ar/common.json"),
          import("../public/locales/en/common.json")
        ]);

        const newTranslations = {
          ar: arTranslations.default,
          en: enTranslations.default
        };

        setTranslations(newTranslations);
        translationCache.ar = arTranslations.default;
        translationCache.en = enTranslations.default;
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, []);

  // Get nested translation value using dot notation (e.g., "common.loading")
  const getNestedValue = (obj: any, path: string): string => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  const t = useCallback((key: string, locale?: string): string => {
    const targetLocale = locale || currentLocale;
    
    if (isLoading) {
      // During loading, return a simple fallback instead of the key
      if (key.includes("loading")) return "Loading...";
      if (key.includes("error")) return "Error";
      if (key.includes("success")) return "Success";
      return key;
    }

    if (!translations[targetLocale]) {
      console.warn(`Translations for locale "${targetLocale}" not found`);
      return key;
    }

    const value = getNestedValue(translations[targetLocale], key);
    if (value === undefined) {
      console.warn(`Translation key "${key}" not found for locale "${targetLocale}"`);
      return key;
    }
    
    return value;
  }, [translations, isLoading, currentLocale]);

  const changeLanguage = useCallback((locale: string) => {
    // Get current pathname
    const pathname = window.location.pathname;
    
    // Remove current locale from path if it exists
    const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "");
    
    // Construct new path with new locale
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    // Navigate to new path
    router.push(newPath);
  }, [router]);

  return { t, changeLanguage, isLoading };
}
