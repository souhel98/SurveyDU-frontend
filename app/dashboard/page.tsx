"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const profileCompleted = localStorage.getItem("profileCompleted");

    console.log("Dashboard Router Debug:", {
      authToken: authToken ? "EXISTS" : "MISSING",
      userType,
      profileCompleted,
      hasToken: !!authToken,
      tokenStartsWith: authToken ? authToken.substring(0, 20) + "..." : "N/A"
    });

    if (!authToken || !userType) {
      console.log("Not authenticated, redirecting to login");
      router.replace("/google-signin");
      return;
    }

    // Check if profile is completed
    if (!profileCompleted) {
      console.log("Profile not completed, redirecting to complete profile");
      router.replace("/auth/student/complete-profile");
      return;
    }

    console.log("Profile completed, redirecting to role-specific dashboard:", userType);

    // Profile completed, redirect based on user type
    if (userType === "Admin") {
      router.replace("/dashboard/admin");
    } else if (userType === "Teacher") {
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