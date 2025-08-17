"use client"

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin-service";
import { DepartmentService } from "@/lib/services/department-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, Users, BarChart3, Settings, TrendingUp, Award, FileText, Activity, PlusCircle } from "lucide-react";
import axios from "@/lib/api/axios";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [totalDepartments, setTotalDepartments] = useState<number>(0);
  const [usersByDepartment, setUsersByDepartment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminCount, setAdminCount] = useState(0);
  const [mySurveysCount, setMySurveysCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data, departments, users, and my surveys in parallel
        const [dashboardData, departments, users, mySurveys] = await Promise.all([
          AdminService.getDashboard(),
          DepartmentService.getDepartments(),
          AdminService.getUsers(),
          axios.get("/Admin/my-surveys")
        ]);
        
        setDashboard(dashboardData.data);
        setTotalDepartments(departments.length);

        // My Surveys count
        setMySurveysCount(Array.isArray(mySurveys.data.data) ? mySurveys.data.data.length : 0);

        // Process users by departmentName
        const usersData = users.data || users;
        const departmentMap = new Map();
        let adminCount = 0;
        
        // Group users by departmentName and count admins
        usersData.forEach((user: any) => {
          if (user.userType === 'Admin') {
            adminCount += 1;
            return;
          }
          if (!user.departmentName) return; // skip users with no department
          if (!departmentMap.has(user.departmentName)) {
            departmentMap.set(user.departmentName, {
              departmentName: user.departmentName,
              teachers: 0,
              students: 0
            });
          }
          const dept = departmentMap.get(user.departmentName);
          if (user.userType === 'Teacher') {
            dept.teachers += 1;
          } else if (user.userType === 'Student') {
            dept.students += 1;
          }
        });
        
        // Convert to array and sort alphabetically
        const usersByDept = Array.from(departmentMap.values())
          .sort((a: any, b: any) => a.departmentName.localeCompare(b.departmentName));
        
        setUsersByDepartment(usersByDept);
        setAdminCount(adminCount);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg mb-4" />
        <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">


      <main className="container mx-auto px-6 py-8">
                {/* Stats Overview */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-blue-400/30 p-3 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-white text-lg">Total Users</CardTitle>
              <CardDescription className="text-blue-100">All registered users</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{dashboard.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-purple-400/30 p-3 rounded-xl">
                  <Building className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-white text-lg">Total Departments</CardTitle>
              <CardDescription className="text-purple-100">All university departments</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{totalDepartments}</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-indigo-400/30 p-3 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-white text-lg">Total Surveys</CardTitle>
              <CardDescription className="text-indigo-100">All surveys in the system</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{dashboard.totalSurveys}</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-green-400/30 p-3 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-white text-lg">My Surveys</CardTitle>
              <CardDescription className="text-green-100">Surveys created by you</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{mySurveysCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics and Management */}
        <div className="grid gap-6 mb-8 lg:grid-cols-3">
          {/* Users by Type */}
          <Card className="lg:col-span-2 group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Users by Type
              </CardTitle>
              <CardDescription>Breakdown by user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-y-auto pr-2" style={{ height: '19rem' }}>
                {adminCount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-700" />
                      <span className="font-semibold text-gray-800">Admins</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{adminCount}</span>
                      <span className="text-xs text-gray-500">total</span>
                    </div>
                  </div>
                )}
                {usersByDepartment.length > 0 ? (
                  usersByDepartment.map((dept: any, index: number) => (
                    <div key={dept.departmentName} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-emerald-500' : 
                          index === 2 ? 'bg-purple-500' : 
                          index === 3 ? 'bg-orange-500' : 'bg-pink-500'
                        }`} />
                        <span className="font-semibold text-gray-800">{dept.departmentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Teachers:</span>
                            <span className="font-semibold text-emerald-600">{dept.teachers}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Students:</span>
                            <span className="font-semibold text-blue-600">{dept.students}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-gray-900">{dept.teachers + dept.students}</div>
                          <div className="text-xs text-gray-500">total</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No users found in departments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Settings className="h-5 w-5 text-emerald-600" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Manage system components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/users" className="flex items-center justify-center">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
              
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/departments" className="flex items-center justify-center">
                  <Building className="h-4 w-4 mr-2" />
                  Manage Departments
                </Link>
              </Button>

              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/all-surveys" className="flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Surveys
                </Link>
              </Button>

              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/create-survey" className="flex items-center justify-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Survey
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-xl mr-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                User Management
              </CardTitle>
              <CardDescription>Manage system users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-xl mr-3">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                Departments
              </CardTitle>
              <CardDescription>Manage university departments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/departments">Manage Departments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-xl mr-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                Survey Management
              </CardTitle>
              <CardDescription>Manage all surveys in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/all-surveys">View All Surveys</Link>
              </Button>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/create-survey">Create New Survey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 