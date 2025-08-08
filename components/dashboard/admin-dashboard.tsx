"use client"

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, Users, BarChart3, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getDashboard()
      .then((data) => {
        setDashboard(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <span className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg" />
      <span className="sr-only">Loading...</span>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>All registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Surveys</CardTitle>
              <CardDescription>All surveys in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalSurveys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Responses</CardTitle>
              <CardDescription>All survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalResponses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Surveys</CardTitle>
              <CardDescription>Currently active surveys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.activeSurveys}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Users by Type</CardTitle>
              <CardDescription>Breakdown by user role</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dashboard.usersByType.map((u: any) => (
                  <li key={u.type} className="flex justify-between">
                    <span>{u.type}</span>
                    <span className="font-bold">{u.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 w-full">
                <Link href="/dashboard/admin/users">Go to User Management</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Management Section */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>Manage system users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 w-full">
                <Link href="/dashboard/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Departments
              </CardTitle>
              <CardDescription>Manage university departments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-blue-500 hover:bg-blue-600 w-full">
                <Link href="/dashboard/admin/departments">Manage Departments</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Analytics
              </CardTitle>
              <CardDescription>View system-wide statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-purple-500 hover:bg-purple-600 w-full">
                <Link href="/dashboard/admin">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* You can add more sections for surveysByStatus, topSurveys, etc. */}
      </main>
    </div>
  );
} 