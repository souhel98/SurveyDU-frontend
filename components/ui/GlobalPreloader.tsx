"use client";

export default function GlobalPreloader({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <span className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg" />
      <span className="sr-only">Loading...</span>
    </div>
  );
} 