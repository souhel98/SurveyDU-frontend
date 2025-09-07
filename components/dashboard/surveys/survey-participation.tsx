"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Award, ChevronRight, Clock, HelpCircle, MessageSquare, Building, GraduationCap, Target, Send, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { SurveyService } from "@/lib/services/survey-service"
import { DepartmentService } from "@/lib/services/department-service"
import { ACADEMIC_YEARS, TARGET_GENDER_SELECT } from "@/lib/constants"
import api from "@/lib/api/axios"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocale } from "@/components/ui/locale-provider"

// Import participation question type components
import ParticipationMultipleChoice from "@/components/question-types/ParticipationMultipleChoice"
import ParticipationSingleAnswer from "@/components/question-types/ParticipationSingleAnswer"
import ParticipationOpenText from "@/components/question-types/ParticipationOpenText"
import ParticipationPercentage from "@/components/question-types/ParticipationPercentage"

interface SurveyParticipationProps {
  surveyId?: string | number;
}

export default function SurveyParticipation({ surveyId }: SurveyParticipationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { currentLocale } = useLocale()
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [showJsonDialog, setShowJsonDialog] = useState(false)
  const [surveyNotAvailable, setSurveyNotAvailable] = useState(false)

  const currentQuestion = useMemo(() => 
    survey?.questions?.[currentQuestionIndex] || null, 
    [survey?.questions, currentQuestionIndex]
  )
  
  const progress = useMemo(() => 
    survey?.questions ? Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100) : 0,
    [currentQuestionIndex, survey?.questions?.length]
  )

  const isQuestionAnswered = useCallback((questionId: number) => {
    const answer = answers[questionId]
    if (!answer) return false
    
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    
    if (typeof answer === 'string') {
      return answer.trim().length > 0
    }
    
    if (typeof answer === 'number') {
      return answer > 0
    }
    
    return true
  }, [answers])

  const handleRadioChange = useCallback((value: string) => {
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [currentQuestion.questionId]: value }))
    }
  }, [currentQuestion?.questionId])

  const handleCheckboxChange = useCallback((optionId: number) => {
    if (currentQuestion) {
      setAnswers(prev => {
        const currentAnswer = prev[currentQuestion.questionId] || []
        const updatedAnswer = currentAnswer.includes(optionId)
          ? currentAnswer.filter((id: number) => id !== optionId)
          : [...currentAnswer, optionId]

        return { ...prev, [currentQuestion.questionId]: updatedAnswer }
      })
    }
  }, [currentQuestion?.questionId])

  const handleTextareaChange = useCallback((value: string) => {
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [currentQuestion.questionId]: value }))
    }
  }, [currentQuestion?.questionId])

  const handleRatingChange = useCallback((rating: number) => {
    if (currentQuestion) {
      setAnswers(prev => ({ ...prev, [currentQuestion.questionId]: rating }))
    }
  }, [currentQuestion?.questionId])

  useEffect(() => {
    if (!surveyId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        let surveyData
        try {
          surveyData = await SurveyService.getStudentSurveyById(Number(surveyId))
        } catch (individualError: any) {
          if (individualError.message === "Survey not found or not available" || 
              individualError.response?.data?.message === "Survey not found or not available") {
            throw new Error("SURVEY_NOT_AVAILABLE")
          }
          
          try {
            const surveysResponse = await api.get("/Student/surveys")
            if (surveysResponse.data && surveysResponse.data.success) {
              const allSurveys = surveysResponse.data.data || []
              const allSurveysFound = allSurveys.find((s: any) => s.surveyId === Number(surveyId))
              surveyData = allSurveysFound
              
              if (!surveyData) {
                throw new Error(`Survey with ID ${surveyId} not found in available surveys`)
              }
            } else {
              throw new Error('Failed to fetch surveys list')
            }
          } catch (listError: any) {
            throw individualError
          }
        }
        
        const deps = await DepartmentService.getDepartments()
        
        if (surveyData && surveyData.questions) {
          const cleanedSurveyData = {
            ...surveyData,
            questions: surveyData.questions.map((question: any, index: number) => ({
              ...question,
              questionId: question.questionId || `temp-${index}`,
              options: question.options?.map((option: any, optIndex: number) => ({
                ...option,
                optionId: option.optionId || `temp-opt-${index}-${optIndex}`
              })) || []
            }))
          }
          setSurvey(cleanedSurveyData)
        } else {
          setSurvey(surveyData)
        }
        setDepartments(deps)
      } catch (error: any) {
        if (error.message === "SURVEY_NOT_AVAILABLE" || error.message === "Survey not found or not available") {
          setSurvey(null)
          setSurveyNotAvailable(true)
          setLoading(false)
          return
        }
        
        let errorMessage = "Failed to fetch survey"
        if (error.response?.status === 401) {
          errorMessage = "You are not authorized to view this survey. Please log in."
        } else if (error.response?.status === 404) {
          errorMessage = "Survey not found. It may have been removed or you don't have access to it."
        } else if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          title: t('common.error', currentLocale),
          description: errorMessage,
          variant: "destructive"
        })
        router.push("/dashboard/student")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [surveyId, toast, router, t, currentLocale])

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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {surveyNotAvailable ? (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('surveys.management.noSurveysFound', currentLocale)}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('surveys.management.tryAdjustingSearch', currentLocale)}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('surveyView.surveyNotFound', currentLocale)}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('surveyView.surveyNotFoundDescription', currentLocale)}
                </p>
              </>
            )}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/dashboard/student")}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {t('dashboard.admin.backToDashboard', currentLocale)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">{t('common.loading', currentLocale)}</p>
        </div>
      </div>
    )
  }

  const canNavigateToQuestion = (targetIndex: number) => {
    if (targetIndex === currentQuestionIndex) return true
    if (targetIndex < currentQuestionIndex) return false
    if (currentQuestion.isRequired && !isQuestionAnswered(currentQuestion.questionId)) {
      return false
    }
    
    for (let i = currentQuestionIndex; i < targetIndex; i++) {
      const question = survey.questions[i]
      if (question.isRequired && !isQuestionAnswered(question.questionId)) {
        return false
      }
    }
    
    return true
  }

  const handleNextQuestion = () => {
    if (currentQuestion.isRequired && !isQuestionAnswered(currentQuestion.questionId)) {
      toast({
        title: t('common.required', currentLocale),
        description: t('auth.fillAllFields', currentLocale),
        variant: "destructive",
      })
      return
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmitSurvey()
    }
  }

  const formatSubmissionData = () => {
    const formattedAnswers: any[] = []
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = survey.questions.find((q: any) => q.questionId === parseInt(questionId))
      
      if (question?.questionType === 'multiple_choice') {
        if (Array.isArray(answer) && answer.length > 0) {
          answer.forEach((optionId: number) => {
            formattedAnswers.push({
              questionId: parseInt(questionId),
              selectedOptionId: optionId,
              textAnswer: null,
              percentageValue: null
            })
          })
        }
      } else if (question?.questionType === 'single_answer') {
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: parseInt(answer),
          textAnswer: null,
          percentageValue: null
        })
      } else if (question?.questionType === 'open_text') {
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: null,
          textAnswer: answer,
          percentageValue: null
        })
      } else if (question?.questionType === 'percentage') {
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: null,
          textAnswer: null,
          percentageValue: parseInt(answer)
        })
      }
    })

    return {
      surveyId: survey.surveyId,
      answers: formattedAnswers,
      comment: comment
    }
  }

  const handleSubmitSurvey = async () => {
    try {
      setSubmitting(true)
      
      const submitData = formatSubmissionData()

      await SurveyService.submitStudentSurveyAnswers(survey.surveyId, submitData)

      toast({
        title: t('common.success', currentLocale),
        description: `${t('success.responseSubmitted', currentLocale)} ${survey.pointsReward} ${t('points.title', currentLocale)}`,
      })

      router.push("/dashboard/student")
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error.message || t('errors.failedToCreateSurvey', currentLocale),
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestionContent = () => {
    switch (currentQuestion.questionType) {
      case "single_answer":
        return (
          <ParticipationSingleAnswer
            options={currentQuestion.options || []}
            selectedOption={answers[currentQuestion.questionId] || ""}
            onSelectionChange={handleRadioChange}
          />
        )

      case "multiple_choice":
        return (
          <ParticipationMultipleChoice
            options={currentQuestion.options || []}
            selectedOptions={answers[currentQuestion.questionId] || []}
            onSelectionChange={handleCheckboxChange}
          />
        )

      case "open_text":
        return (
          <ParticipationOpenText
            value={answers[currentQuestion.questionId] || ""}
            onChange={handleTextareaChange}
          />
        )

      case "percentage":
        return (
          <ParticipationPercentage
            currentRating={answers[currentQuestion.questionId] || 0}
            onRatingChange={handleRatingChange}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-5">
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {survey.title}
              </h1>
              <p className="text-gray-600 text-sm mt-1 md:mt-0">
                {survey.description}
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <div className="flex items-center bg-emerald-100 px-3 py-1 rounded-full">
                <Award className="h-4 w-4 text-emerald-600 mr-2" />
                <span className="text-sm font-medium text-emerald-700">{survey.pointsReward} {t('points.title', currentLocale)}</span>
              </div>
              <div className="text-sm text-gray-500">
                {t('statistics.question', currentLocale)} {currentQuestionIndex + 1} {t('statistics.outOf', currentLocale)} {survey.questions.length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <Card className="mb-6 bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{progress}%</div>
                    <div className="text-sm text-gray-500">{t('common.completed', currentLocale)}</div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-emerald-600" />
                    {t('surveyView.surveyDetails', currentLocale)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-sm font-bold text-blue-600">{survey.currentParticipants}</div>
                      <div className="text-xs text-gray-500">{t('common.participants', currentLocale)}</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="text-sm font-bold text-orange-600">{survey.questions.length}</div>
                      <div className="text-xs text-gray-500">{t('common.questions', currentLocale)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{t('surveyView.createdBy', currentLocale)}</div>
                        <div className="text-gray-500">{survey.ownerName}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Target className="h-3 w-3 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{t('surveyView.targetAudience', currentLocale)}</div>
                        <div className="text-gray-500 capitalize">
                          {TARGET_GENDER_SELECT.find(g => g.value === survey.targetGender)?.label || survey.targetGender}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <GraduationCap className="h-3 w-3 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{t('statistics.academicYears', currentLocale)}</div>
                        <div className="text-gray-500">
                          {survey.targetAcademicYears?.map((year: number) => {
                            const found = ACADEMIC_YEARS.find(y => y.value === year)
                            return found ? found.label : year
                          }).join(", ") || "All Years"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start text-sm">
                      <Building className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{t('statistics.departments', currentLocale)}</div>
                        <div className="text-gray-500 break-words">
                          {survey.targetDepartmentIds?.map((id: number) => {
                            const found = departments.find(dep => dep.id === id)
                            return found ? found.name : `Department ${id}`
                          }).join(", ") || "All Departments"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium mb-2">{t('common.timeline', currentLocale)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-500">{t('common.startDate', currentLocale)}: {new Date(survey.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-gray-500">{t('common.endDate', currentLocale)}: {new Date(survey.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`question-${currentQuestionIndex || 0}-${currentQuestion?.questionId || 'loading'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white shadow-lg border-0 mb-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium mr-3">
                            {t('statistics.question', currentLocale)} {currentQuestionIndex + 1}
                          </span>
                          {currentQuestion.isRequired && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                              {t('common.required', currentLocale)}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl text-gray-900">
                          {currentQuestion.questionText}
                        </CardTitle>
                        {currentQuestion.questionType === "multiple_choice" && (
                          <CardDescription className="mt-2 text-emerald-600">
                            💡 {t('common.questionTypes.multipleChoice', currentLocale)}
                          </CardDescription>
                        )}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                            <HelpCircle className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('common.srOnly.more', currentLocale)}</DialogTitle>
                            <DialogDescription>
                              {currentQuestion.questionType === "single_answer" && t('common.questionTypes.singleChoice', currentLocale)}
                              {currentQuestion.questionType === "multiple_choice" && t('common.questionTypes.multipleChoice', currentLocale)}
                              {currentQuestion.questionType === "open_text" && t('common.questionTypes.openTextDescription', currentLocale)}
                              {currentQuestion.questionType === "percentage" && t('common.questionTypes.percentageDescription', currentLocale)}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    {renderQuestionContent()}
                  </CardContent>
                  {currentQuestionIndex < survey.questions.length - 1 && (
                    <CardFooter className="flex justify-end pt-0">
                      <Button 
                        onClick={handleNextQuestion}
                        className="px-6 bg-emerald-500 hover:bg-emerald-600"
                      >
                        {currentLocale === 'ar' ? (
                          <>{t('common.next', currentLocale)}<ChevronRight className="mr-2 h-4 w-4 rotate-180" /> </>
                        ) : (
                          <>{t('common.next', currentLocale)} <ChevronRight className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {survey.questions && survey.questions.length > 0 && survey.questions.map((question: any, index: number) => {
                  const canNavigate = canNavigateToQuestion(index)
                  const uniqueKey = question.questionId || `question-${index}`
                  
                  return (
                    <button
                      key={`nav-${uniqueKey}-${index}`}
                      onClick={() => {
                        if (canNavigate) {
                          setCurrentQuestionIndex(index)
                        } else {
                          toast({
                            title: t('common.error', currentLocale),
                            description: t('auth.fillAllFields', currentLocale),
                            variant: "destructive",
                          })
                        }
                      }}
                      disabled={!canNavigate}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? "bg-emerald-500 scale-110"
                          : canNavigate
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-200 cursor-not-allowed"
                      }`}
                    />
                  )
                })}
              </div>
            </div>

            {currentQuestionIndex === survey.questions.length - 1 && (
              <motion.div
                key="comment-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
                      {t('statistics.comments', currentLocale)} ({t('common.optional', currentLocale)})
                    </CardTitle>
                    <CardDescription>
                      {t('statistics.commentsLeftByStudents', currentLocale)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder={t('statistics.comment', currentLocale)} 
                      className="h-24 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </CardContent>
                </Card>
                
                <div className="mt-6 mb-3">
                  <Button 
                    onClick={() => setShowJsonDialog(true)}
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t('surveyCreator.showJSON', currentLocale)}
                  </Button>
                </div>

                <div className="mt-3">
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={submitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('common.processing', currentLocale)}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('common.submit', currentLocale)}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('surveyCreator.editSurveyJSON', currentLocale)}</DialogTitle>
            <DialogDescription>{t('surveyCreator.jsonDescription', currentLocale)}</DialogDescription>
          </DialogHeader>
          <pre className="bg-gray-100 rounded p-4 text-xs max-h-[60vh] overflow-auto">
            {JSON.stringify(formatSubmissionData(), null, 2)}
          </pre>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowJsonDialog(false)}>
              {t('common.close', currentLocale)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}