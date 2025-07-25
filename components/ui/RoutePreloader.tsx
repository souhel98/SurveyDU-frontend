"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import GlobalPreloader from "@/components/ui/GlobalPreloader";
import { useGlobalLoader } from "@/components/ui/LoaderContext";

export default function RoutePreloader() {
  const [localLoading, setLocalLoading] = useState(false);
  const pathname = usePathname();
  const { loading } = useGlobalLoader();

  useEffect(() => {
    setLocalLoading(true);
    const timeout = setTimeout(() => setLocalLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return <GlobalPreloader show={loading || localLoading} />;
} 