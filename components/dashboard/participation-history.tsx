"use client"

import React, { useState, useEffect } from "react"
import { SurveyService } from "@/lib/services/survey-service"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  History, 
  Search, 
  Award, 
  Calendar, 
  MessageSquare, 
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ParticipationHistoryItem {
  responseId: number
  title: string
  description: string
  pointsEarned: number
  completionDate: string
  hasComment: boolean
}

export default function ParticipationHistory() {
  const { toast } = useToast()
  const router = useRouter()
  const [history, setHistory] = useState<ParticipationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchParticipationHistory()
  }, [])

  const fetchParticipationHistory = async () => {
    try {
      setLoading(true)
      const response = await SurveyService.getStudentParticipationHistory()
      if (response.success && response.data) {
        setHistory(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch participation history")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch participation history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPointsEarned = history.reduce((sum, item) => sum + item.pointsEarned, 0)
  const totalSurveysCompleted = history.length
  const surveysWithComments = history.filter(item => item.hasComment).length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Loading participation history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <History className="h-6 w-6 text-emerald-600" />
                <h1 className="text-xl font-semibold text-gray-900">Participation History</h1>
              </div>
            </div>
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Total Points Earned</p>
                  <p className="text-2xl font-bold text-emerald-900">{totalPointsEarned}</p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Surveys Completed</p>
                  <p className="text-2xl font-bold text-blue-900">{totalSurveysCompleted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">With Comments</p>
                  <p className="text-2xl font-bold text-purple-900">{surveysWithComments}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search surveys by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>Survey Participation History</span>
            </CardTitle>
            <CardDescription>
              View all the surveys you've completed and the points you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No matching surveys found" : "No participation history yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Complete your first survey to see your participation history here"
                  }
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/student">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Browse Available Surveys
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Survey</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Points Earned</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Completion Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.responseId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <Award className="h-3 w-3 mr-1" />
                            {item.pointsEarned} points
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(item.completionDate)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {item.hasComment ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                              No
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 