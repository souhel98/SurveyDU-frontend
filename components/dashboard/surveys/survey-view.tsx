"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Target, 
  GraduationCap, 
  Building,
  CheckCircle,
  Circle,
  FileText,
  BarChart2,
  Edit,
  Copy,
  Trash2,
  Play,
  AlertCircle,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SurveyService } from "@/lib/services/survey-service"
import { DepartmentService } from "@/lib/services/department-service"
import { ACADEMIC_YEARS, TARGET_GENDER_SELECT, SURVEY_STATUS_LABELS } from "@/lib/constants"
import { motion } from "framer-motion"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocale } from "@/components/ui/locale-provider"

interface SurveyViewProps {
  surveyId?: string | number;
}

interface SurveyData {
  surveyId: number;
  title: string;
  description: string;
  pointsReward: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerName: string;
  requiredParticipants: number;
  currentParticipants: number;
  targetGender: string;
  targetAcademicYears: number[];
  targetDepartmentIds: number[];
  questions: {
    questionId: number;
    questionText: string;
    questionType: string;
    isRequired: boolean;
    questionOrder: number;
    options: {
      optionId: number;
      optionText: string;
      optionOrder: number;
    }[];
  }[];
}

export default function SurveyView({ surveyId }: SurveyViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { currentLocale } = useLocale()
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [duplicating, setDuplicating] = useState(false)
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [quickEditDialogOpen, setQuickEditDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState({
    startDate: '',
    endDate: '',
    requiredParticipants: 0
  })
  const [updatingSurveyId, setUpdatingSurveyId] = useState<number | null>(null)

  useEffect(() => {
    if (!surveyId) return

    const fetchSurveyData = async () => {
      try {
        setLoading(true)
        const data = await SurveyService.getTeacherSurveyById(Number(surveyId))
        setSurvey(data)
      } catch (error: any) {
        toast({
          title: t('common.error', currentLocale),
          description: error.message || t('surveyView.failedToFetchSurveyDetails', currentLocale),
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        const deps = await DepartmentService.getDepartments()
        setDepartments(deps)
      } catch (error) {
        console.error("Failed to fetch departments:", error)
      }
    }

    fetchSurveyData()
    fetchDepartments()
  }, [surveyId, toast])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-50 text-green-600 border-green-200", label: t('common.active', currentLocale), icon: <Play className="h-3 w-3 mr-1" /> },
      draft: { color: "bg-orange-50 text-orange-600 border-orange-200", label: t('common.draft', currentLocale), icon: <Clock className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-blue-50 text-blue-600 border-blue-200", label: t('common.completed', currentLocale), icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      inactive: { color: "bg-red-50 text-red-600 border-red-200", label: t('common.inactive', currentLocale), icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      expired: { color: "bg-purple-50 text-purple-600 border-purple-200", label: t('common.expired', currentLocale), icon: <Clock className="h-3 w-3 mr-1" /> }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'single_answer':
        return <Circle className="h-4 w-4" />
      case 'multiple_choice':
        return <CheckCircle className="h-4 w-4" />
      case 'open_text':
        return <FileText className="h-4 w-4" />
      case 'percentage':
        return <BarChart2 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single_answer':
        return t('common.questionTypes.singleChoice', currentLocale)
      case 'multiple_choice':
        return t('common.questionTypes.multipleChoice', currentLocale)
      case 'open_text':
        return t('common.questionTypes.text', currentLocale)
      case 'percentage':
        return t('surveyCreator.questionTypes.percentage', currentLocale)
      default:
        return type
    }
  }

  const handleStartQuickEdit = () => {
    if (!survey) return
    
    setEditingData({
      startDate: survey.startDate ? new Date(survey.startDate).toISOString().split('T')[0] : '',
      endDate: survey.endDate ? new Date(survey.endDate).toISOString().split('T')[0] : '',
      requiredParticipants: survey.requiredParticipants
    })
    setQuickEditDialogOpen(true)
  }

  const handleCancelQuickEdit = () => {
    setQuickEditDialogOpen(false)
    setEditingData({
      startDate: '',
      endDate: '',
      requiredParticipants: 0
    })
  }

  const handleSaveQuickEdit = async () => {
    if (!survey) return
    
    try {
      setUpdatingSurveyId(survey.surveyId)
      
      // Validate required participants
      if (editingData.requiredParticipants <= 0) {
        toast({
          title: t('common.error', currentLocale),
          description: t('surveys.management.requiredParticipantsMustBeGreater', currentLocale),
          variant: "destructive"
        });
        return;
      }

      // Validate dates
      if (editingData.startDate && editingData.endDate) {
        const startDate = new Date(editingData.startDate);
        const endDate = new Date(editingData.endDate);
        
        if (startDate >= endDate) {
          toast({
            title: t('common.error', currentLocale),
            description: t('surveys.management.endDateMustBeAfterStartDate', currentLocale),
            variant: "destructive"
          });
          return;
        }
      }

      // Prepare the update data with proper formatting
      const updateData: any = {
        requiredParticipants: editingData.requiredParticipants
      };

      // Check if survey has participants
      const hasParticipants = currentParticipants > 0;
      const isActiveWithParticipants = survey?.status === 'active' && hasParticipants;
      const isExpiredWithParticipants = survey?.status === 'expired' && hasParticipants;
      const isCompletedWithParticipants = survey?.status === 'completed' && hasParticipants;
      const isInactive = survey?.status === 'inactive';
      const hasParticipantsForEdit = isActiveWithParticipants || isExpiredWithParticipants || isCompletedWithParticipants;

      // Only include dates if they are provided and allowed
      if (editingData.endDate) {
        updateData.endDate = editingData.endDate;
      }
      
      // Include start date if survey doesn't have participants OR is inactive
      if (editingData.startDate && (!hasParticipantsForEdit || isInactive)) {
        updateData.startDate = editingData.startDate;
      }

      await SurveyService.updateTeacherSurveyDates(survey.surveyId, updateData)
      
      // Refresh survey data
      const updatedSurvey = await SurveyService.getTeacherSurveyById(survey.surveyId)
      setSurvey(updatedSurvey)
      
      toast({
        title: t('common.success', currentLocale),
        description: t('success.surveyUpdated', currentLocale),
      })
      
      setQuickEditDialogOpen(false)
      
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error.message || t('errors.failedToUpdateSurvey', currentLocale),
        variant: "destructive"
      })
    } finally {
      setUpdatingSurveyId(null)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDuplicateSurvey = async () => {
    if (!survey) return
    
    try {
      setDuplicating(true)
      const duplicatedSurvey = await SurveyService.duplicateTeacherSurvey(survey.surveyId)
      
      toast({
        title: t('common.success', currentLocale),
        description: t('surveys.management.surveyDuplicatedSuccessfully', currentLocale) + ' ' + t('surveyView.redirectingToNewSurvey', currentLocale),
      })
      
      // Redirect to the new survey view page
      setTimeout(() => {
        router.push(`/dashboard/teacher/surveys/${duplicatedSurvey.surveyId}/view`)
      }, 1500)
      
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error.message || t('errors.failedToDuplicateSurvey', currentLocale),
        variant: "destructive"
      })
    } finally {
      setDuplicating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">{t('surveyView.loadingSurvey', currentLocale)}</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('surveyView.surveyNotFound', currentLocale)}</h2>
          <p className="text-gray-600 mb-4">{t('surveyView.surveyNotFoundDescription', currentLocale)}</p>
          <Button onClick={() => router.back()}>{t('common.back', currentLocale)}</Button>
        </div>
      </div>
    )
  }

  // Normalize participants fields in case API uses different names
  const currentParticipants = Number((survey as any)?.currentParticipants ?? (survey as any)?.totalResponses ?? (survey as any)?.participantsCount ?? 0)
  const requiredParticipants = Number((survey as any)?.requiredParticipants ?? 0)
  const completionRate = requiredParticipants > 0 
    ? (currentParticipants / requiredParticipants) * 100 
    : 0
  const hasParticipants = currentParticipants > 0

  const isExpired = new Date(survey.endDate) < new Date()
  const isActive = survey.status === 'active' && !isExpired

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{t('surveyView.surveyOverview', currentLocale)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{survey.title}</h3>
                  <p className="text-gray-600">{survey.description}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {getStatusBadge(survey.status)}
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{t('surveyView.createdBy', currentLocale)} {survey.ownerName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{t('common.questions', currentLocale)} ({survey.questions.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {survey.questions.map((question, index) => (
                    <motion.div
                      key={question.questionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-sm font-medium">
                            Q{index + 1}
                          </span>
                          {getQuestionTypeIcon(question.questionType)}
                          <span className="text-sm text-gray-500">
                            {getQuestionTypeLabel(question.questionType)}
                          </span>
                          {question.isRequired && (
                            <Badge variant="destructive" className="text-xs">{t('common.required', currentLocale)}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{question.questionText}</p>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option.optionId} className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-gray-300 rounded-full" />
                              <span>{option.optionText}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Survey Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('surveys.management.statistics', currentLocale)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t('common.status', currentLocale)}</span>
                  {getStatusBadge(survey.status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t('common.participants', currentLocale)}</span>
                  <span className="font-medium">
                    {currentParticipants} / {requiredParticipants}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">{t('surveyView.completionRate', currentLocale)}</span>
                    <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t('common.pointsReward', currentLocale)}</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{survey.pointsReward}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Survey Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('surveyView.surveyDetails', currentLocale)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t('common.startDate', currentLocale)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(survey.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t('common.endDate', currentLocale)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(survey.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t('common.targetGender', currentLocale)}</p>
                    <p className="text-sm text-gray-500">
                      {survey.targetGender === 'all' ? t('common.all', currentLocale) : 
                       survey.targetGender === 'male' ? t('common.male', currentLocale) : 
                       survey.targetGender === 'female' ? t('common.female', currentLocale) : 
                       survey.targetGender}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('common.targetAcademicYears', currentLocale)}</p>
                    <p className="text-sm text-gray-500">
                      {survey.targetAcademicYears.map(year => {
                        switch(year) {
                          case 1: return t('common.academicYears.first', currentLocale)
                          case 2: return t('common.academicYears.second', currentLocale)
                          case 3: return t('common.academicYears.third', currentLocale)
                          case 4: return t('common.academicYears.fourth', currentLocale)
                          case 5: return t('common.academicYears.fifth', currentLocale)
                          default: return year.toString()
                        }
                      }).join(", ")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('common.targetDepartments', currentLocale)}</p>
                    <p className="text-sm text-gray-500">
                      {survey.targetDepartmentIds.map(id => {
                        const found = departments.find(dep => dep.id === id)
                        return found ? found.name : id
                      }).join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('surveyView.actions', currentLocale)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/teacher/surveys/${survey.surveyId}/statistics`)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {t('surveys.management.viewStatistics', currentLocale)}
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleStartQuickEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.quickEdit', currentLocale)}
                </Button>
                {survey.status === 'draft' && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/teacher/create-survey?edit=${survey.surveyId}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('surveyView.editSurvey', currentLocale)}
                  </Button>
                )}
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleDuplicateSurvey}
                  disabled={duplicating}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {duplicating ? t('surveyView.duplicating', currentLocale) : t('surveyView.duplicateSurvey', currentLocale)}
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    // Copy student survey URL to clipboard
                    navigator.clipboard.writeText(`${window.location.origin}/dashboard/student/surveys/${survey.surveyId}/`)
                    toast({
                      title: t('surveyView.studentLinkCopied', currentLocale),
                      description: t('surveyView.surveyLinkCopiedToClipboard', currentLocale),
                    })
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('surveyView.copyLinkForStudents', currentLocale)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={quickEditDialogOpen} onOpenChange={setQuickEditDialogOpen}>
        <DialogContent className={`sm:max-w-[600px] ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
          <DialogHeader>
            <DialogTitle className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
              {t('surveyView.quickEditSurvey', currentLocale)}
              {survey && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {survey.title}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
              {survey?.status === 'active' && hasParticipants
                ? t('surveys.management.updateEndDateAndParticipantRequirementsForActiveSurvey', currentLocale)
                : survey?.status === 'expired' && hasParticipants
                ? t('surveys.management.updateEndDateAndParticipantRequirementsForExpiredSurvey', currentLocale)
                : survey?.status === 'completed' && hasParticipants
                ? t('surveys.management.updateEndDateAndParticipantRequirementsForCompletedSurvey', currentLocale)
                : survey?.status === 'inactive'
                ? t('surveys.management.updateSurveyDatesAndParticipantRequirementsForScheduledSurvey', currentLocale)
                : t('surveys.management.updateSurveyDatesAndParticipantRequirements', currentLocale)
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {(survey?.status === 'active' && hasParticipants) || 
             (survey?.status === 'expired' && hasParticipants) ||
             (survey?.status === 'completed' && hasParticipants) ? (
              // For active/expired/completed surveys with participants - only end date and participants
              <div className="space-y-4">
                <div className={`p-3 border rounded-lg ${
                  survey?.status === 'active'
                    ? 'bg-orange-50 border-orange-200'
                    : survey?.status === 'expired'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 ${
                      survey?.status === 'active'
                        ? 'text-orange-600'
                        : survey?.status === 'expired'
                        ? 'text-purple-600'
                        : 'text-indigo-600'
                    }`} />
                    <p className={`text-sm ${
                      survey?.status === 'active'
                        ? 'text-orange-800'
                        : survey?.status === 'expired'
                        ? 'text-purple-800'
                        : 'text-indigo-800'
                    }`}>
                      {t('surveys.management.startDateIsLockedBecauseThisSurveyHasParticipants', currentLocale)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.endDate', currentLocale)}</label>
                  <Input
                    type="date"
                    value={editingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('surveyView.current', currentLocale)}: {new Date(survey.endDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(',', ' -')}
                    </p>
                  )}
                </div>
              </div>
            ) : survey?.status === 'expired' ? (
              // For expired surveys - only show end date and participants
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-purple-800">
                      {t('surveys.management.thisSurveyHasExpired', currentLocale)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.endDate', currentLocale)}</label>
                  <Input
                    type="date"
                    value={editingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('surveyView.current', currentLocale)}: {new Date(survey.endDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(',', ' -')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // For surveys without participants - show both start and end date
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('common.startDate', currentLocale)}</label>
                  <Input
                    type="date"
                    value={editingData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('surveyView.current', currentLocale)}: {new Date(survey.startDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(',', ' -')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.endDate', currentLocale)}</label>
                  <Input
                    type="date"
                    value={editingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('surveyView.current', currentLocale)}: {new Date(survey.endDate).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(',', ' -')}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('common.requiredParticipants', currentLocale)}</label>
              <Input
                type="number"
                min="1"
                value={editingData.requiredParticipants}
                onChange={(e) => handleInputChange('requiredParticipants', parseInt(e.target.value) || 0)}
                className="h-10"
                placeholder={t('surveys.management.minimum1', currentLocale)}
              />
              <p className={`text-xs text-gray-500 mt-1 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('surveys.management.current', currentLocale)}: {survey?.requiredParticipants || 0}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelQuickEdit}
                disabled={updatingSurveyId !== null}
              >
                {t('common.cancel', currentLocale)}
              </Button>
              <Button
                onClick={handleSaveQuickEdit}
                disabled={updatingSurveyId !== null}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {updatingSurveyId !== null ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('surveys.management.saving', currentLocale)}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('surveys.management.saveChanges', currentLocale)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}