"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface LocaleContextType {
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

interface LocaleProviderProps {
  children: ReactNode;
}

export default function LocaleProvider({ children }: LocaleProviderProps) {
  const [currentLocale, setCurrentLocale] = useState('ar');

  useEffect(() => {
    // Load preferred locale from localStorage
    const savedLocale = localStorage.getItem('preferredLocale');
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
      setCurrentLocale(savedLocale);
    }

    // Listen for locale changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferredLocale' && e.newValue) {
        setCurrentLocale(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update HTML attributes based on locale
  useEffect(() => {
    const html = document.documentElement;
    html.lang = currentLocale;
    html.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    
    // Add/remove RTL-specific classes
    if (currentLocale === 'ar') {
      html.classList.add('rtl');
      html.classList.remove('ltr');
    } else {
      html.classList.add('ltr');
      html.classList.remove('rtl');
    }
  }, [currentLocale]);

  const handleLocaleChange = (locale: string) => {
    setCurrentLocale(locale);
    localStorage.setItem('preferredLocale', locale);
  };

  return (
    <LocaleContext.Provider value={{ currentLocale, setCurrentLocale: handleLocaleChange }}>
      {children}
    </LocaleContext.Provider>
  );
} 