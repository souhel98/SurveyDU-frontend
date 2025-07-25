"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface LoaderContextType {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(LoaderContext);
  if (!context) throw new Error("useGlobalLoader must be used within a LoaderProvider");
  return context;
} 