"use client";
import DashboardLayout from "@/components/dashboard-layout";
import StudentDashboard from "@/components/dashboard/student-dashboard";

export default function StudentDashboardPage() {
  return (
    <DashboardLayout>
      <StudentDashboard />
    </DashboardLayout>
  );
}
