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
          title: "Error",
          description: error.message || "Failed to fetch survey details",
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
      active: { color: "bg-green-50 text-green-600 border-green-200", label: "Active", icon: <Play className="h-3 w-3 mr-1" /> },
      draft: { color: "bg-orange-50 text-orange-600 border-orange-200", label: "Draft", icon: <Clock className="h-3 w-3 mr-1" /> },
      completed: { color: "bg-blue-50 text-blue-600 border-blue-200", label: "Completed", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      inactive: { color: "bg-red-50 text-red-600 border-red-200", label: "Inactive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
      expired: { color: "bg-purple-50 text-purple-600 border-purple-200", label: "Expired", icon: <Clock className="h-3 w-3 mr-1" /> }
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
        return 'Single Answer'
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'open_text':
        return 'Open Text'
      case 'percentage':
        return 'Percentage'
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
      
      const updateData = {
        startDate: editingData.startDate,
        endDate: editingData.endDate,
        requiredParticipants: editingData.requiredParticipants
      }
      
      await SurveyService.updateTeacherSurveyDates(survey.surveyId, updateData)
      
      // Refresh survey data
      const updatedSurvey = await SurveyService.getTeacherSurveyById(survey.surveyId)
      setSurvey(updatedSurvey)
      
      toast({
        title: "Success",
        description: "Survey updated successfully!",
      })
      
      setQuickEditDialogOpen(false)
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update survey",
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
        title: "Success",
        description: "Survey duplicated successfully! Redirecting to the new survey...",
      })
      
      // Redirect to the new survey view page
      setTimeout(() => {
                 router.push(`/dashboard/teacher/surveys/${duplicatedSurvey.surveyId}/view`)
      }, 1500)
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate survey",
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
          <p className="text-gray-600">Loading survey details...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Found</h2>
          <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const completionRate = survey.requiredParticipants > 0 
    ? (survey.currentParticipants / survey.requiredParticipants) * 100 
    : 0

  const isExpired = new Date(survey.endDate) < new Date()
  const isActive = survey.status === 'active' && !isExpired

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                <p className="text-sm text-gray-500">Survey Details</p>
              </div>
            </div>
                         <div className="flex items-center space-x-2">
                                       <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/teacher/surveys/${survey.surveyId}/statistics`)}
                        >
                          <BarChart2 className="h-4 w-4 mr-2" />
                          View Statistics
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartQuickEdit}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Quick Edit
                        </Button>
               {survey.status === 'draft' && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => router.push(`/dashboard/teacher/create-survey?edit=${survey.surveyId}`)}
                 >
                   <Edit className="h-4 w-4 mr-2" />
                   Edit
                 </Button>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Survey Overview</span>
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
                    <span>Created by {survey.ownerName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Questions ({survey.questions.length})</span>
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
                            <Badge variant="destructive" className="text-xs">Required</Badge>
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
                <CardTitle>Survey Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(survey.status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Participants</span>
                  <span className="font-medium">
                    {survey.currentParticipants} / {survey.requiredParticipants}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Completion Rate</span>
                    <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Points Reward</span>
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
                <CardTitle>Survey Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(survey.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-gray-500">
                      {new Date(survey.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Target Gender</p>
                    <p className="text-sm text-gray-500">
                      {TARGET_GENDER_SELECT.find(g => g.value === survey.targetGender)?.label || survey.targetGender}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Academic Years</p>
                    <p className="text-sm text-gray-500">
                      {survey.targetAcademicYears.map(year => {
                        const found = ACADEMIC_YEARS.find(y => y.value === year)
                        return found ? found.label : year
                      }).join(", ")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Departments</p>
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
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/teacher/surveys/${survey.surveyId}/statistics`)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View Statistics
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleStartQuickEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Quick Edit
                </Button>
                                 {survey.status === 'draft' && (
                   <Button 
                     className="w-full justify-start" 
                     variant="outline"
                     onClick={() => router.push(`/dashboard/teacher/create-survey?edit=${survey.surveyId}`)}
                   >
                     <Edit className="h-4 w-4 mr-2" />
                     Edit Survey
                   </Button>
                 )}
                                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={handleDuplicateSurvey}
                   disabled={duplicating}
                 >
                   <Copy className="h-4 w-4 mr-2" />
                   {duplicating ? "Duplicating..." : "Duplicate Survey"}
                 </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    // Copy survey URL to clipboard
                                         navigator.clipboard.writeText(`${window.location.origin}/dashboard/teacher/surveys/${survey.surveyId}/view`)
                    toast({
                      title: "Link copied",
                      description: "Survey link has been copied to clipboard",
                    })
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Edit Dialog */}
      <Dialog open={quickEditDialogOpen} onOpenChange={setQuickEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Quick Edit Survey
              {survey && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {survey.title}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {survey?.status === 'active' && survey?.currentParticipants > 0
                ? "Update the end date and participant requirements for this active survey. Start date cannot be changed once survey has participants."
                : survey?.status === 'expired' && survey?.currentParticipants > 0
                ? "Update the end date and participant requirements for this expired survey. Start date cannot be changed once survey has participants."
                : survey?.status === 'completed' && survey?.currentParticipants > 0
                ? "Update the end date and participant requirements for this completed survey. Start date cannot be changed once survey has participants."
                : survey?.status === 'inactive'
                ? "Update the survey dates and participant requirements for this scheduled survey. All fields can be modified."
                : "Update the survey dates and participant requirements."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {survey?.status === 'active' && survey?.currentParticipants > 0 || 
             survey?.status === 'expired' && survey?.currentParticipants > 0 ||
             survey?.status === 'completed' && survey?.currentParticipants > 0 ? (
              // For active/expired/completed surveys with participants - only end date and participants
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={editingData.startDate}
                    disabled
                    className="h-10 bg-gray-50"
                    placeholder="Cannot be changed"
                  />
                  {survey?.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {new Date(survey.startDate).toLocaleString('en-GB', {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={editingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {new Date(survey.endDate).toLocaleString('en-GB', {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={editingData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {new Date(survey.startDate).toLocaleString('en-GB', {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={editingData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="h-10"
                    placeholder="YYYY-MM-DD"
                  />
                  {survey?.endDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {new Date(survey.endDate).toLocaleString('en-GB', {
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Participants</label>
              <Input
                type="number"
                min="1"
                value={editingData.requiredParticipants}
                onChange={(e) => handleInputChange('requiredParticipants', parseInt(e.target.value) || 0)}
                className="h-10"
                placeholder="Minimum: 1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {survey?.requiredParticipants || 0}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelQuickEdit}
                disabled={updatingSurveyId !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveQuickEdit}
                disabled={updatingSurveyId !== null}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {updatingSurveyId !== null ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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