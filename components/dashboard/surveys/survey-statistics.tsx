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

  Radio,
  CheckSquare,
  Type
} from 'lucide-react'
import { SurveyService } from '@/lib/services/survey-service'
import { DepartmentService } from '@/lib/services/department-service'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocale } from '@/components/ui/locale-provider'

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
  const { t } = useTranslation()
  const { currentLocale } = useLocale()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [statisticsData, departmentsData] = await Promise.all([
          SurveyService.getTeacherSurveyStatistics(surveyId),
          DepartmentService.getDepartments()
        ])
        
        setStatistics(statisticsData)
        setDepartments(departmentsData)
      } catch (err: any) {
        console.error('Error fetching statistics:', err)
        setError(err.message || t('statistics.errorLoading', currentLocale))
        toast({
          title: t('common.error', currentLocale),
          description: err.message || t('statistics.errorLoading', currentLocale),
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
        return <BarChart3 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return t('statistics.multipleChoice', currentLocale)
      case 'single_answer':
        return t('statistics.singleAnswer', currentLocale)
      case 'open_text':
        return t('statistics.openText', currentLocale)
      case 'percentage':
        return t('statistics.ratingScale', currentLocale)
      default:
        return type
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male':
        return t('statistics.male', currentLocale)
      case 'female':
        return t('statistics.female', currentLocale)
      case 'all':
        return t('statistics.allGenders', currentLocale)
      default:
        return gender
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('statistics.loading', currentLocale)}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('statistics.errorLoading', currentLocale)}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back', currentLocale)}
          </Button>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('statistics.noStatistics', currentLocale)}</h2>
          <p className="text-gray-600 mb-6">{t('statistics.noStatisticsDescription', currentLocale)}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back', currentLocale)}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Survey Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('statistics.totalResponses', currentLocale)}</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.surveyInfo.totalResponses}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('statistics.outOf', currentLocale)} {statistics.surveyInfo.requiredParticipants} {t('statistics.required', currentLocale)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('statistics.completionRate', currentLocale)}</CardTitle>
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
              <CardTitle className="text-sm font-medium">{t('common.questions', currentLocale)}</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.questionStatistics.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('statistics.totalQuestions', currentLocale)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('statistics.comments', currentLocale)}</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.comments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('statistics.feedbackReceived', currentLocale)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Survey Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {t('statistics.surveyInformation', currentLocale)}
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
                    <span className="text-sm text-gray-600">{t('statistics.owner', currentLocale)}: {statistics.surveyInfo.ownerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {t('statistics.targetGender', currentLocale)}: {getGenderLabel(statistics.surveyInfo.targetGender)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {t('statistics.academicYears', currentLocale)}: {statistics.surveyInfo.targetAcademicYears.join(', ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {t('statistics.departments', currentLocale)}: {
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
                  <h4 className="font-semibold text-blue-900 mb-2">{t('statistics.responseProgress', currentLocale)}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700">{t('statistics.currentResponses', currentLocale)}</span>
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
                  <h4 className="font-semibold text-green-900 mb-2">{t('statistics.completionRate', currentLocale)}</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.surveyInfo.completionRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-green-700">
                    {statistics.surveyInfo.completionRate >= 100 ? t('statistics.targetAchieved', currentLocale) : t('statistics.targetNotYetReached', currentLocale)}
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
              {t('statistics.questionStatistics', currentLocale)}
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('statistics.comments', currentLocale)} ({statistics.comments.length})
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
                      <span className="text-sm text-gray-500">{t('statistics.question', currentLocale)} {index + 1}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {question.totalAnswers} {t('statistics.responses', currentLocale)}
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
                      <h4 className="font-semibold text-gray-900">{t('statistics.textResponses', currentLocale)}:</h4>
                      {question.textAnswers.length > 0 ? (
                        <div className="space-y-2">
                          {question.textAnswers.map((answer, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">"{answer}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">{t('statistics.noTextResponsesYet', currentLocale)}</p>
                      )}
                    </div>
                  ) : question.questionType === 'percentage' ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">{t('statistics.ratingDistribution', currentLocale)}:</h4>
                      {question.percentageStats.length > 0 ? (
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const count = question.percentageStats.filter(stat => stat === rating).length
                            const percentage = question.totalAnswers > 0 ? (count / question.totalAnswers) * 100 : 0
                            return (
                              <div key={rating} className="text-center">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-1 mx-auto">
                                  <span className="text-sm font-medium text-emerald-700">{rating}</span>
                                </div>
                                <div className="text-sm font-semibold">{count}</div>
                                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">{t('statistics.noRatingsYet', currentLocale)}</p>
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
                  {t('statistics.studentComments', currentLocale)}
                </CardTitle>
                <CardDescription>
                  {t('statistics.commentsLeftByStudents', currentLocale)}
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
                            <p className="text-xs text-gray-500 mt-2">{t('statistics.comment', currentLocale)} #{index + 1}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('statistics.noCommentsYet', currentLocale)}</h3>
                    <p className="text-gray-600">
                      {t('statistics.studentsHaventLeftComments', currentLocale)}
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