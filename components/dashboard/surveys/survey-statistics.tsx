"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Target, 
  Calendar, 
  Award, 
  MessageSquare,
  Building,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Star,
  Radio,
  CheckSquare,
  Type
} from 'lucide-react'
import { SurveyService } from '@/lib/services/survey-service'
import { DepartmentService } from '@/lib/services/department-service'
import { useToast } from '@/hooks/use-toast'

interface SurveyStatisticsProps {
  surveyId: string
}

interface QuestionStat {
  questionId: number
  questionText: string
  questionType: string
  totalAnswers: number
  options: Array<{
    optionId: number
    optionText: string
    count: number
    percentage: number
  }>
  textAnswers: string[]
  percentageStats: number[]
}

interface SurveyInfo {
  surveyId: number
  title: string
  description: string
  ownerName: string
  totalResponses: number
  requiredParticipants: number
  completionRate: number
  targetGender: string
  targetAcademicYears: number[]
  targetDepartmentIds: number[]
}

interface StatisticsData {
  surveyInfo: SurveyInfo
  questionStatistics: QuestionStat[]
  comments: string[]
}

export default function SurveyStatistics({ surveyId }: SurveyStatisticsProps) {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [statisticsData, departmentsData] = await Promise.all([
          SurveyService.getSurveyStatistics(surveyId),
          DepartmentService.getDepartments()
        ])
        
        setStatistics(statisticsData)
        setDepartments(departmentsData)
      } catch (err: any) {
        console.error('Error fetching statistics:', err)
        setError(err.message || 'Failed to fetch survey statistics')
        toast({
          title: "Error",
          description: err.message || 'Failed to fetch survey statistics',
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [surveyId, toast])

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckSquare className="h-4 w-4" />
      case 'single_answer':
        return <Radio className="h-4 w-4" />
      case 'open_text':
        return <Type className="h-4 w-4" />
      case 'percentage':
        return <Star className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'single_answer':
        return 'Single Answer'
      case 'open_text':
        return 'Open Text'
      case 'percentage':
        return 'Rating'
      default:
        return type
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Male'
      case 'female':
        return 'Female'
      case 'all':
        return 'All Genders'
      default:
        return gender
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading survey statistics...</p>
      </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Statistics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Statistics Available</h2>
          <p className="text-gray-600 mb-6">This survey doesn't have any statistics yet.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Survey Statistics</h1>
                <p className="text-sm text-gray-600">Detailed analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Analytics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Survey Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.surveyInfo.totalResponses}
              </div>
              <p className="text-xs text-muted-foreground">
                out of {statistics.surveyInfo.requiredParticipants} required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.surveyInfo.completionRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out"
                  style={{ 
                    width: `${statistics.surveyInfo.completionRate}%` 
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.questionStatistics.length}
              </div>
              <p className="text-xs text-muted-foreground">
                total questions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.comments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                feedback received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Survey Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Survey Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{statistics.surveyInfo.title}</h3>
                <p className="text-gray-600 mb-4">{statistics.surveyInfo.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Owner: {statistics.surveyInfo.ownerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Target Gender: {getGenderLabel(statistics.surveyInfo.targetGender)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Academic Years: {statistics.surveyInfo.targetAcademicYears.join(', ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Departments: {
                        statistics.surveyInfo.targetDepartmentIds
                          .map(id => departments.find(dep => dep.id === id)?.name || id)
                          .join(', ')
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Response Progress</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700">Current Responses</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {statistics.surveyInfo.totalResponses} / {statistics.surveyInfo.requiredParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out"
                      style={{ 
                        width: `${statistics.surveyInfo.requiredParticipants ? (statistics.surveyInfo.totalResponses / statistics.surveyInfo.requiredParticipants) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Completion Rate</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.surveyInfo.completionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-green-700">
                    {statistics.surveyInfo.completionRate >= 100 ? 'Target achieved!' : 'Target not yet reached'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Questions and Comments */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Question Statistics
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({statistics.comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {statistics.questionStatistics.map((question, index) => (
              <Card key={question.questionId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getQuestionTypeIcon(question.questionType)}
                        {getQuestionTypeLabel(question.questionType)}
                      </Badge>
                      <span className="text-sm text-gray-500">Question {index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {question.totalAnswers} responses
                    </div>
                  </div>
                  <CardTitle className="text-lg">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  {question.questionType === 'multiple_choice' || question.questionType === 'single_answer' ? (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <div key={option.optionId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{option.optionText}</span>
                            <span className="text-sm text-gray-600">
                              {option.count} ({option.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${option.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : question.questionType === 'open_text' ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Text Responses:</h4>
                      {question.textAnswers.length > 0 ? (
                        <div className="space-y-2">
                          {question.textAnswers.map((answer, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">"{answer}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No text responses yet.</p>
                      )}
                    </div>
                  ) : question.questionType === 'percentage' ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Rating Distribution:</h4>
                      {question.percentageStats.length > 0 ? (
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const count = question.percentageStats.filter(stat => stat === rating).length
                            const percentage = question.totalAnswers > 0 ? (count / question.totalAnswers) * 100 : 0
                            return (
                              <div key={rating} className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-xs ml-1">{rating}</span>
                                </div>
                                <div className="text-sm font-semibold">{count}</div>
                                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No ratings yet.</p>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Student Comments & Feedback
                </CardTitle>
                <CardDescription>
                  Comments left by students when completing the survey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics.comments.length > 0 ? (
                  <div className="space-y-4">
                    {statistics.comments.map((comment, index) => (
                      <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-100 p-2 rounded-full">
                            <MessageSquare className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">"{comment}"</p>
                            <p className="text-xs text-gray-500 mt-2">Comment #{index + 1}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Comments Yet</h3>
                    <p className="text-gray-600">
                      Students haven't left any comments for this survey yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 