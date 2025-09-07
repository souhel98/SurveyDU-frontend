"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocaleContextType {
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState('ar');

  // Load preferred locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferredLocale');
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
      setCurrentLocale(savedLocale);
    }
  }, []);

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

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
} 