"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Clock, MessageSquare, Calendar, BookOpen, User, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DepartmentService } from "@/lib/services/department-service"
import { UserService } from "@/lib/services/user-service"
import api from "@/lib/api/axios"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocale } from "@/components/ui/locale-provider"

// Helper to format date
function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  
  // State
  const [surveys, setSurveys] = useState<any[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [profileRequirements, setProfileRequirements] = useState<any>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  // Fetch all data in parallel
  useEffect(() => {
    setLoading(true)
    setError(null)
    console.log("Fetching student dashboard data...")
    
    Promise.all([
      api.get("/Student/surveys"),
      DepartmentService.getDepartments(),
      UserService.getCurrentUserProfile(),
    ])
      .then(([surveyRes, deptRes, profileRes]) => {
        console.log("API responses:", { surveyRes, deptRes, profileRes })
        
        if (!surveyRes.data.success) throw new Error(surveyRes.data.message)
        setSurveys(surveyRes.data.data || [])
        // Handle department response - it could be an array or an object with data property
        const deptData = Array.isArray(deptRes) ? deptRes : (deptRes as any)?.data || deptRes || []
        setDepartments(deptData)
        setProfile(profileRes.data)
        
        console.log("Data set successfully:", {
          surveys: surveyRes.data.data?.length || 0,
          departments: deptData.length || 0,
          profile: !!profileRes.data
        })
      })
      .catch((e) => {
        console.error("Error loading dashboard data:", e)
        setError(e.message || "Failed to load data")
      })
      .finally(() => setLoading(false))
  }, [])

  // Check profile completion status
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setCheckingProfile(false);
          return;
        }

        const response = await fetch("https://mhhmd6g0-001-site1.rtempurl.com/api/Auth/profile-requirements", {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Profile requirements check:", data);
          setProfileRequirements(data);
        } else {
          console.log("Failed to check profile requirements");
        }
      } catch (err) {
        console.error("Error checking profile requirements:", err);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, []);

  // Map department IDs to names for each survey
  const departmentMap = useMemo(() => {
    const map: Record<number, string> = {}
    departments.forEach((d) => (map[d.id] = d.name))
    return map
  }, [departments])

  // Filter and search logic - only show active surveys for students
  const filteredSurveys = useMemo(() => {
    let filtered = surveys.filter(
      (s) =>
        s.isEligible &&
        !s.hasParticipated &&
        s.status === 'active'
    )
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    }
    
    // Sort by survey ID from newest to oldest (highest ID to lowest ID)
    filtered.sort((a, b) => {
      const idA = parseInt(a.surveyId) || 0
      const idB = parseInt(b.surveyId) || 0
      return idB - idA
    })
    
    return filtered
  }, [surveys, searchQuery])

  // Profile summary fields
  const profileFields = [
    { label: t('profile.department', currentLocale), value: profile?.department },
    { label: t('profile.academicYear', currentLocale), value: profile?.academicYear },
    { label: t('profile.gender', currentLocale), value: profile?.gender },
  ].filter((f) => f.value)

  return (
    <div className="bg-gray-50">
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Profile summary */}
        {profile && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pb-2">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg truncate">
                  {profile.firstName} {profile.lastName}
                </CardTitle>
                <CardDescription className="text-sm truncate">{profile.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-0">
              {profileFields.map((f) => (
                <div key={f.label} className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{f.label}:</span> {f.value}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Notification */}
        {!checkingProfile && profileRequirements && !profileRequirements.isProfileComplete && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    {t('auth.personalInformation', currentLocale)}
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {t('auth.fillAllFields', currentLocale)}
                  </p>
                  
                  {/* Show what's missing */}
                  {profileRequirements.missingFields && profileRequirements.missingFields.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-amber-700 mb-2">{t('auth.fillAllFields', currentLocale)}:</p>
                      <div className="flex flex-wrap gap-2">
                        {profileRequirements.missingFields.map((field: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-amber-300 text-amber-700 bg-amber-100">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => window.location.href = '/auth/student/complete-profile'}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {t('profile.updateProfile', currentLocale)}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => setCheckingProfile(true)}
                    >
                      {t('common.refresh', currentLocale)}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('surveys.management.searchSurveys', currentLocale)}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>



        {/* Available Surveys Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.student.availableSurveys', currentLocale)}</h2>
              <p className="text-sm sm:text-base text-gray-600">{t('dashboard.student.surveysYouCanParticipate', currentLocale)}</p>
            </div>
          </div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">{t('common.loading', currentLocale)}</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredSurveys.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey) => (
                  <Card key={survey.surveyId} className="w-full group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
                    
                    <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6">
                      <div className="flex justify-between items-start gap-2 sm:gap-3">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {survey.title}
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium shadow-sm flex-shrink-0">
                          {survey.pointsReward} pts
                        </Badge>
                      </div>
                      <CardDescription className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {survey.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 sm:pb-4">
                      <div className="space-y-3 sm:space-y-4">
                        {/* Owner Info */}
                        <div className="flex items-center p-2 sm:p-3 bg-gray-50/70 rounded-lg">
                          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-full mr-2 sm:mr-3">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 font-medium">{t('surveyView.createdBy', currentLocale)}</p>
                            <p className="text-sm text-gray-900 font-medium truncate">{survey.ownerName}</p>
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50/70 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 font-medium">{t('common.startDate', currentLocale)}</p>
                            <p className="text-sm text-gray-900 font-medium">{formatDate(survey.startDate)}</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50/70 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 font-medium">{t('common.endDate', currentLocale)}</p>
                            <p className="text-sm text-gray-900 font-medium">{formatDate(survey.endDate)}</p>
                          </div>
                        </div>

                        {/* Participants Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{t('common.participants', currentLocale)}</span>
                            <span className="text-sm font-semibold text-emerald-600">
                              {survey.currentParticipants}/{survey.requiredParticipants}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
                              style={{ 
                                width: `${survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>


                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Link href={`/dashboard/student/surveys/${survey.surveyId}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t('common.participate', currentLocale)}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('surveys.management.noSurveysFound', currentLocale)}</h3>
                <p className="text-gray-500">{t('surveys.management.tryAdjustingSearch', currentLocale)}</p>
              </div>
            )}
        </div>
      </main>
    </div>
  )
}
