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

// Helper to format date
function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString()
}

export default function StudentDashboard() {
  // State
  const [surveys, setSurveys] = useState<any[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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
        setDepartments(deptRes.success ? deptRes.data : deptRes)
        setProfile(profileRes.data)
        
        console.log("Data set successfully:", {
          surveys: surveyRes.data.data?.length || 0,
          departments: deptRes.success ? deptRes.data?.length : deptRes?.length || 0,
          profile: !!profileRes.data
        })
      })
      .catch((e) => {
        console.error("Error loading dashboard data:", e)
        setError(e.message || "Failed to load data")
      })
      .finally(() => setLoading(false))
  }, [])

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
    { label: "Department", value: profile?.department },
    { label: "Academic Year", value: profile?.academicYear },
    { label: "Gender", value: profile?.gender },
  ].filter((f) => f.value)

  return (
    <div className="bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        {/* Profile summary */}
        {profile && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <User className="h-8 w-8 text-emerald-600" />
              <div>
                <CardTitle className="text-lg">
                  {profile.firstName} {profile.lastName}
                </CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 pt-0">
              {profileFields.map((f) => (
                <div key={f.label} className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{f.label}:</span> {f.value}
                </div>
              ))}

            </CardContent>
          </Card>
        )}



        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search surveys..."
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
              <h2 className="text-2xl font-bold text-gray-900">Available Surveys</h2>
              <p className="text-gray-600">Surveys you can participate in to earn points</p>
            </div>
          </div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredSurveys.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey) => (
                  <Card key={survey.surveyId} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
                    
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {survey.title}
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 px-3 py-1 text-sm font-medium shadow-sm">
                          {survey.pointsReward} pts
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {survey.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="space-y-4">
                        {/* Owner Info */}
                        <div className="flex items-center p-3 bg-gray-50/70 rounded-lg">
                          <div className="p-2 bg-emerald-100 rounded-full mr-3">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Created by</p>
                            <p className="text-sm text-gray-900 font-medium">{survey.ownerName}</p>
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50/70 rounded-lg">
                            <Calendar className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 font-medium">Start Date</p>
                            <p className="text-sm text-gray-900 font-medium">{formatDate(survey.startDate)}</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50/70 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 font-medium">End Date</p>
                            <p className="text-sm text-gray-900 font-medium">{formatDate(survey.endDate)}</p>
                          </div>
                        </div>

                        {/* Participants Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Participants</span>
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
                          Take Survey
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
                <h3 className="text-lg font-medium text-gray-900 mb-1">No surveys found</h3>
                <p className="text-gray-500">There is currently no survey directed to you.</p>
              </div>
            )}
        </div>
      </main>
    </div>
  )
}
