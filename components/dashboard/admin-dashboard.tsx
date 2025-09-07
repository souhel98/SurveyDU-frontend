"use client"

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin-service";
import { DepartmentService } from "@/lib/services/department-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, Users, BarChart3, Settings, TrendingUp, Award, FileText, Activity, PlusCircle, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import axios from "@/lib/api/axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
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
        setError(t('dashboard.admin.failedToLoadDashboardData', currentLocale));
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
        const label = `${monthStr} ${date.getFullYear()}`; // ensure uniqueness across years

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
          name: label,
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
        <p className="text-gray-600 text-lg">{t('dashboard.admin.loadingAdminDashboard', currentLocale)}</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.admin.errorLoadingDashboard', currentLocale)}</h2>
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
                <CardTitle className="text-blue-800 text-lg">{t('dashboard.admin.allUsers', currentLocale)}</CardTitle>
                <div className="text-3xl font-bold text-blue-900">{dashboard.totalUsers}</div>
              </div>
              <CardDescription className="text-blue-600">{t('dashboard.admin.allRegisteredUsers', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/users">{t('dashboard.admin.viewUsers', currentLocale)}</Link>
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
                <CardTitle className="text-purple-800 text-lg">{t('dashboard.admin.allDepartments', currentLocale)}</CardTitle>
                <div className="text-3xl font-bold text-purple-900">{totalDepartments}</div>
              </div>
              <CardDescription className="text-purple-600">{t('dashboard.admin.allUniversityDepartments', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/departments">{t('dashboard.admin.viewDepartments', currentLocale)}</Link>
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
                <CardTitle className="text-green-800 text-lg">{t('dashboard.admin.allSurveys', currentLocale)}</CardTitle>
                <div className="text-3xl font-bold text-green-900">{dashboard.totalSurveys}</div>
              </div>
              <CardDescription className="text-green-600">{t('dashboard.admin.allSurveysInSystem', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/all-surveys">{t('dashboard.admin.viewAllSurveys', currentLocale)}</Link>
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
                <CardTitle className="text-green-800 text-lg">{t('dashboard.admin.mySurveys', currentLocale)}</CardTitle>
                <div className="text-3xl font-bold text-green-900">{mySurveysCount}</div>
              </div>
              <CardDescription className="text-green-600">{t('dashboard.admin.surveysCreatedByYou', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/dashboard/admin/create-survey">{t('dashboard.admin.createSurvey', currentLocale)}</Link>
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
                  <CardTitle className="text-xl">{t('dashboard.admin.surveyStartTimeline', currentLocale)}</CardTitle>
                  <CardDescription>{t('dashboard.admin.numberOfSurveysWithStatus', currentLocale)}</CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={chartTimeframe === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('week')}
                  className={chartTimeframe === 'week' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {t('dashboard.admin.week', currentLocale)}
                </Button>
                <Button
                  variant={chartTimeframe === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTimeframeChange('month')}
                  className={chartTimeframe === 'month' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {t('dashboard.admin.month', currentLocale)}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const hasAnyData = Array.isArray(surveyChartData) && surveyChartData.some((d: any) => STATUS_KEYS.some((k) => (d?.[k] ?? 0) > 0));
              return hasAnyData;
            })() ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={surveyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      domain={[(dataMin: number) => (chartTimeframe === 'week' ? 0 : 2), (dataMax: number) => Math.max(2, dataMax)]}
                      allowDecimals={false}
                      ticks={(() => {
                        const maxTotal = Array.isArray(surveyChartData)
                          ? Math.max(
                              0,
                              ...surveyChartData.map((d: any) =>
                                STATUS_KEYS.reduce((sum, k) => sum + (d?.[k] ?? 0), 0)
                              )
                            )
                          : 0;
                        const minTick = chartTimeframe === 'week' ? 0 : 2;
                        const upper = Math.max(2, maxTotal);
                        const start = Math.min(minTick, upper);
                        return Array.from({ length: upper - start + 1 }, (_, i) => start + i);
                      })()}
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
                    <Bar dataKey="active" stackId="a" fill="#10b981" name={t('common.active', currentLocale)} isAnimationActive={false} minPointSize={2} />
                    <Bar dataKey="draft" stackId="a" fill="#f59e42" name={t('common.draft', currentLocale)} isAnimationActive={false} minPointSize={2} />
                    <Bar dataKey="completed" stackId="a" fill="#6366f1" name={t('common.completed', currentLocale)} isAnimationActive={false} minPointSize={2} />
                    <Bar dataKey="inactive" stackId="a" fill="#ef4444" name={t('common.inactive', currentLocale)} isAnimationActive={false} minPointSize={2} />
                    <Bar dataKey="expired" stackId="a" fill="#a855f7" name={t('common.expired', currentLocale)} isAnimationActive={false} minPointSize={2} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4 space-x-6 text-sm">
                  <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div><span className="text-gray-600">{t('common.active', currentLocale)}</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-[#f59e42] rounded mr-2"></div><span className="text-gray-600">{t('common.draft', currentLocale)}</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-[#6366f1] rounded mr-2"></div><span className="text-gray-600">{t('common.completed', currentLocale)}</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-[#ef4444] rounded mr-2"></div><span className="text-gray-600">{t('common.inactive', currentLocale)}</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-[#a855f7] rounded mr-2"></div><span className="text-gray-600">{t('common.expired', currentLocale)}</span></div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>{t('dashboard.admin.noSurveyStartsFound', currentLocale)}</p>
                  <p className="text-sm">{t('dashboard.admin.createOrScheduleSurveys', currentLocale)}</p>
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
                {t('dashboard.admin.usersByType', currentLocale)}
              </CardTitle>
              <CardDescription>{t('dashboard.admin.breakdownByUserRole', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 overflow-y-auto pr-2" style={{ height: '19rem' }}>
                {adminCount > 0 && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-between">
                    <div className="flex items-center gap-1 space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-700" />
                      <span className="font-semibold text-gray-800">{t('dashboard.admin.admins', currentLocale)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{adminCount}</span>
                      <span className="text-xs text-gray-500">{t('dashboard.admin.total', currentLocale)}</span>
                    </div>
                  </div>
                )}
                {usersByDepartment.length > 0 ? (
                  usersByDepartment.map((dept: any, index: number) => (
                    <div key={dept.departmentName} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200">
                      <div className="flex items-center gap-1 space-x-3 mb-3">
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
                            <span className="text-sm text-gray-600">{t('dashboard.admin.teachers', currentLocale)}:</span>
                            <span className="font-semibold text-emerald-600">{dept.teachers}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">{t('dashboard.admin.students', currentLocale)}:</span>
                            <span className="font-semibold text-blue-600">{dept.students}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-gray-900">{dept.teachers + dept.students}</div>
                          <div className="text-xs text-gray-500">{t('dashboard.admin.total', currentLocale)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t('dashboard.admin.noUsersFoundInDepartments', currentLocale)}
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
                {t('dashboard.admin.quickActions', currentLocale)}
              </CardTitle>
              <CardDescription>{t('dashboard.admin.manageSystemComponents', currentLocale)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full py-7 mt-3 justify-between bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group">
                <Link href="/dashboard/admin/users" className="flex w-full items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-3 rounded-lg bg-white/20 p-2">
                      <Users className="h-4 w-4" />
                    </span>
                    <span>{t('dashboard.admin.userManagement', currentLocale)}</span>
                  </span>
                  {   currentLocale === 'ar' ? 
                  <ChevronLeft className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" /> 
                  :
                  <ChevronRight className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" />
                  }
                  </Link>
              </Button>
              
              <Button asChild className="w-full py-7 justify-between bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group">
                <Link href="/dashboard/admin/departments" className="flex w-full items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-3 rounded-lg bg-white/20 p-2">
                      <Building className="h-4 w-4" />
                    </span>
                    <span>{t('dashboard.admin.departments', currentLocale)}</span>
                  </span>
                  {   currentLocale === 'ar' ? 
                  <ChevronLeft className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" /> 
                  :
                  <ChevronRight className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" />
                  }
                  </Link>
              </Button>

              <Button asChild className="w-full py-7 justify-between bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group">
                <Link href="/dashboard/admin/all-surveys" className="flex w-full items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-3 rounded-lg bg-white/20 p-2">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span>{t('dashboard.admin.allSurveys', currentLocale)}</span>
                  </span>
                  {   currentLocale === 'ar' ? 
                  <ChevronLeft className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" /> 
                  :
                  <ChevronRight className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" />
                  }
                  </Link>
              </Button>

              <Button asChild className="w-full py-7 justify-between bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group">
                <Link href="/dashboard/admin/create-survey" className="flex w-full items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-3 rounded-lg bg-white/20 p-2">
                      <PlusCircle className="h-4 w-4" />
                    </span>
                    <span>{t('dashboard.admin.createSurvey', currentLocale)}</span>
                  </span>
                  {   currentLocale === 'ar' ? 
                  <ChevronLeft className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" /> 
                  :
                  <ChevronRight className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5" />
                  }
                  </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        
      </main>
    </div>
  );
} 