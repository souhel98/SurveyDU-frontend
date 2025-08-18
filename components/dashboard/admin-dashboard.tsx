"use client"

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin-service";
import { DepartmentService } from "@/lib/services/department-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, Users, BarChart3, Settings, TrendingUp, Award, FileText, Activity, PlusCircle, Calendar } from "lucide-react";
import axios from "@/lib/api/axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [totalDepartments, setTotalDepartments] = useState<number>(0);
  const [usersByDepartment, setUsersByDepartment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminCount, setAdminCount] = useState(0);
  const [mySurveysCount, setMySurveysCount] = useState(0);
  const [surveyChartData, setSurveyChartData] = useState<any[]>([]);
  const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data, departments, users, my surveys, and survey chart data in parallel
        const [dashboardData, departments, users, mySurveys, surveyData] = await Promise.all([
          AdminService.getDashboard(),
          DepartmentService.getDepartments(),
          AdminService.getUsers(),
          axios.get("/Admin/my-surveys"),
          axios.get("/Admin/surveys") // Fetch all surveys for chart data
        ]);
        
        setDashboard(dashboardData.data);
        setTotalDepartments(departments.length);

        // My Surveys count
        setMySurveysCount(Array.isArray(mySurveys.data.data) ? mySurveys.data.data.length : 0);

        // Process survey chart data - always use all surveys
        let surveyDataForChart = [];
        if (surveyData.data && surveyData.data.data) {
          surveyDataForChart = surveyData.data.data;
        }

        if (surveyDataForChart.length > 0) {
          const processedData = processSurveyChartData(surveyDataForChart, chartTimeframe);
          setSurveyChartData(processedData);
        } else {
          setSurveyChartData([]);
        }

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
  }, [chartTimeframe]);

  const STATUS_KEYS = ['draft', 'active', 'completed', 'inactive', 'expired']; // match your status keys

  const processSurveyChartData = (surveys: any[], timeframe: 'week' | 'month') => {
    const now = new Date();
    const data: any[] = [];

    // Helper to get status in lowercase
    const getStatus = (survey: any) => (survey.status || '').toLowerCase();

    if (timeframe === 'week') {
      for (let i = -7; i <= 6; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Count surveys by status for this date
        const statusCounts: Record<string, number> = {};
        STATUS_KEYS.forEach(status => statusCounts[status] = 0);

        surveys.forEach(survey => {
          if (!survey.startDate) return;
          let surveyStartDate = new Date(survey.startDate);
          if (typeof survey.startDate === 'string' && survey.startDate.includes('/')) {
            const parts = survey.startDate.split('/');
            if (parts.length === 3) {
              surveyStartDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
          if (surveyStartDate.toDateString() === date.toDateString()) {
            const status = getStatus(survey);
            if (STATUS_KEYS.includes(status)) {
              statusCounts[status]++;
            }
          }
        });

        data.push({
          name: dateStr,
          ...statusCounts,
        });
      }
    } else {
      // month view
      for (let i = -12; i <= 5; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });

        const statusCounts: Record<string, number> = {};
        STATUS_KEYS.forEach(status => statusCounts[status] = 0);

        surveys.forEach(survey => {
          if (!survey.startDate) return;
          let surveyStartDate = new Date(survey.startDate);
          if (typeof survey.startDate === 'string' && survey.startDate.includes('/')) {
            const parts = survey.startDate.split('/');
            if (parts.length === 3) {
              surveyStartDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
          if (
            surveyStartDate.getMonth() === date.getMonth() &&
            surveyStartDate.getFullYear() === date.getFullYear()
          ) {
            const status = getStatus(survey);
            if (STATUS_KEYS.includes(status)) {
              statusCounts[status]++;
            }
          }
        });

        data.push({
          name: monthStr,
          ...statusCounts,
        });
      }
    }
    return data;
  };

  const handleTimeframeChange = (newTimeframe: 'week' | 'month') => {
    setChartTimeframe(newTimeframe);
  };

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
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-800 border border-blue-200">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-800 text-lg">Total Users</CardTitle>
                <div className="text-3xl font-bold text-blue-900">{dashboard.totalUsers}</div>
              </div>
              <CardDescription className="text-blue-600">All registered users</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/users">View Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-800 border border-purple-200">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-800 text-lg">Total Departments</CardTitle>
                <div className="text-3xl font-bold text-purple-900">{totalDepartments}</div>
              </div>
              <CardDescription className="text-purple-600">All university departments</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/departments">View Departments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border border-green-200">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 text-lg">Total Surveys</CardTitle>
                <div className="text-3xl font-bold text-green-900">{dashboard.totalSurveys}</div>
              </div>
              <CardDescription className="text-green-600">All surveys in the system</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/all-surveys">View All Surveys</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border border-green-200">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-transparent" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 text-lg">My Surveys</CardTitle>
                <div className="text-3xl font-bold text-green-900">{mySurveysCount}</div>
              </div>
              <CardDescription className="text-green-600">Surveys created by you</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/create-survey">Create Survey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Survey Analytics Chart */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Survey Timeline</CardTitle>
                  <CardDescription>Surves Count by Status</CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={chartTimeframe === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('week')}
                  className={chartTimeframe === 'week' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Week
                </Button>
                <Button
                  variant={chartTimeframe === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('month')}
                  className={chartTimeframe === 'month' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {surveyChartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surveyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: '600' }}
                    />
                    <Bar dataKey="active" stackId="a" fill="#10b981" name="Active" />
                    <Bar dataKey="draft" stackId="a" fill="#f59e42" name="Draft" />
                    <Bar dataKey="completed" stackId="a" fill="#6366f1" name="Completed" />
                    <Bar dataKey="inactive" stackId="a" fill="#ef4444" name="Inactive" />
                    <Bar dataKey="expired" stackId="a" fill="#a855f7" name="Expired" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No survey data available</p>
                  <p className="text-sm">Surveys will appear here once they are created</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
              <Button asChild className="w-full btn-blue">
                <Link href="/dashboard/admin/users" className="flex items-center justify-center">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Link>
              </Button>
              
              <Button asChild className="w-full btn-purple">
                <Link href="/dashboard/admin/departments" className="flex items-center justify-center">
                  <Building className="h-4 w-4 mr-2" />
                  Departments
                </Link>
              </Button>

              <Button asChild className="w-full btn-emerald">
                <Link href="/dashboard/admin/all-surveys" className="flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  All Surveys
                </Link>
              </Button>

              <Button asChild className="w-full btn-emerald">
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
                <div className="bg-blue-100 p-3 rounded-xl mr-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                User Management
              </CardTitle>
              <CardDescription>Manage system users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-blue">
                <Link href="/dashboard/admin/users">User Management</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-xl mr-3">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                Departments
              </CardTitle>
              <CardDescription>Manage university departments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full btn-purple">
                <Link href="/dashboard/admin/departments">Departments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-xl mr-3">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                Survey Management
              </CardTitle>
              <CardDescription>Manage all surveys in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full btn-emerald">
                <Link href="/dashboard/admin/all-surveys">All Surveys</Link>
              </Button>
              <Button asChild className="w-full btn-emerald">
                <Link href="/dashboard/admin/create-survey">Create Survey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 