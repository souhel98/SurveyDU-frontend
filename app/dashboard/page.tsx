"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const part = parts.pop();
        if (part) return part.split(';').shift();
      }
      return undefined;
    }
    const role = getCookie("role");
    if (role === "Admin") {
      router.replace("/dashboard/admin");
    } else if (role === "Teacher") {
      router.replace("/dashboard/teacher");
    } else {
      router.replace("/dashboard/student");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-emerald-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-gray-600 text-lg">Redirecting to your dashboard...</span>
      </div>
    </div>
  );
} 