"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

import { Award, ChevronLeft, ChevronRight, Clock, HelpCircle, MessageSquare, ArrowLeft, User, Calendar, Users, Building, GraduationCap, Target, Send, FileText } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { SurveyService } from "@/lib/services/survey-service"
import { DepartmentService } from "@/lib/services/department-service"
import { ACADEMIC_YEARS, TARGET_GENDER_SELECT } from "@/lib/constants"
import api from "@/lib/api/axios"

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
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [showJsonDialog, setShowJsonDialog] = useState(false)
  const [surveyNotAvailable, setSurveyNotAvailable] = useState(false)

  // Memoized values - must be at the top level
  const currentQuestion = useMemo(() => 
    survey?.questions?.[currentQuestionIndex] || null, 
    [survey?.questions, currentQuestionIndex]
  )
  
  const progress = useMemo(() => 
    survey?.questions ? Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100) : 0,
    [currentQuestionIndex, survey?.questions?.length]
  )

  // Helper function to check if a question is answered
  const isQuestionAnswered = useCallback((questionId: number) => {
    const answer = answers[questionId]
    if (!answer) return false
    
    // For multiple choice, check if at least one option is selected
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    
    // For text answers, check if not empty
    if (typeof answer === 'string') {
      return answer.trim().length > 0
    }
    
    // For rating questions, check if rating is greater than 0
    if (typeof answer === 'number') {
      return answer > 0
    }
    
    // For single choice, any value is considered answered
    return true
  }, [answers])

  // Event handlers - must be at the top level
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
        
        // First try to get the individual survey
        let surveyData
        try {
          surveyData = await SurveyService.getStudentSurveyById(Number(surveyId))
          console.log('Individual survey data loaded:', surveyData)
        } catch (individualError: any) {
          console.warn('Failed to fetch individual survey, trying to get from list:', individualError)
          
          // Check if it's the specific "Survey not found or not available" error
          if (individualError.message === "Survey not found or not available" || 
              individualError.response?.data?.message === "Survey not found or not available") {
            throw new Error("SURVEY_NOT_AVAILABLE")
          }
          
          // Fallback: try to get from the surveys list
          try {
            const surveysResponse = await api.get("/Student/surveys")
            if (surveysResponse.data && surveysResponse.data.success) {
              const allSurveys = surveysResponse.data.data || []
              const allSurveysFound = allSurveys.find((s: any) => s.surveyId === Number(surveyId))
              surveyData = allSurveysFound
              
              if (!surveyData) {
                throw new Error(`Survey with ID ${surveyId} not found in available surveys`)
              }
              
              console.log('Survey data loaded from list:', surveyData)
            } else {
              throw new Error('Failed to fetch surveys list')
            }
          } catch (listError: any) {
            console.error('Failed to fetch from surveys list:', listError)
            throw individualError // Throw the original error
          }
        }
        
        // Get departments
        const deps = await DepartmentService.getDepartments()
        
        // Validate and clean survey data
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
        console.log('Final survey data:', surveyData) // Debug log
        console.log('Departments loaded:', deps) // Debug log
      } catch (error: any) {
        console.error('Error in fetchData:', error)
        
        // Handle the specific "Survey not found or not available" case
        if (error.message === "SURVEY_NOT_AVAILABLE" || error.message === "Survey not found or not available") {
          setSurvey(null)
          setSurveyNotAvailable(true)
          setLoading(false)
          return // Don't redirect, let the component show the appropriate message
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
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
        router.push("/dashboard/student")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [surveyId, toast, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Loading survey...</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Survey Not Available</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  This survey is currently not available for participation. This could be because:
                </p>
                <div className="text-left space-y-2 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">You have already completed this survey</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">The survey has ended or is not yet active</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">The survey has been removed by the creator</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Survey Not Found</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  The survey you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </>
            )}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/dashboard/student")}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push("/dashboard/student/participation-history")}
                className="w-full"
              >
                View Participation History
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safety check - don't render if currentQuestion is null
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    )
  }

  // Helper function to check if user can navigate to a specific question
  const canNavigateToQuestion = (targetIndex: number) => {
    // Can only navigate to current question or next question (if current is answered)
    if (targetIndex === currentQuestionIndex) return true
    
    // Can't go back to previous questions
    if (targetIndex < currentQuestionIndex) return false
    
    // Can't skip ahead if current question is required and not answered
    if (currentQuestion.isRequired && !isQuestionAnswered(currentQuestion.questionId)) {
      return false
    }
    
    // Check if all questions before target are answered (if required)
    for (let i = currentQuestionIndex; i < targetIndex; i++) {
      const question = survey.questions[i]
      if (question.isRequired && !isQuestionAnswered(question.questionId)) {
        return false
      }
    }
    
    return true
  }

  const handleNextQuestion = () => {
    // Check if current question is required and not answered
    if (currentQuestion.isRequired && !isQuestionAnswered(currentQuestion.questionId)) {
      toast({
        title: "Required Question",
        description: "Please answer this question before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit survey directly without dialog
      handleSubmitSurvey()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }



  const formatSubmissionData = () => {
    const formattedAnswers: any[] = []
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = survey.questions.find((q: any) => q.questionId === parseInt(questionId))
      
      if (question?.questionType === 'multiple_choice') {
        // For multiple choice, answer is an array of option IDs
        // We need to send each selected option as a separate answer
        if (Array.isArray(answer) && answer.length > 0) {
          answer.forEach((optionId: number) => {
            formattedAnswers.push({
              questionId: parseInt(questionId),
              selectedOptionId: optionId,
              textAnswer: null,
              percentageValue: null
            })
          })
        } else {
          formattedAnswers.push({
            questionId: parseInt(questionId),
            selectedOptionId: null,
            textAnswer: null,
            percentageValue: null
          })
        }
      } else if (question?.questionType === 'single_answer') {
        // For single answer, answer is a single option ID
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: parseInt(answer),
          textAnswer: null,
          percentageValue: null
        })
      } else if (question?.questionType === 'open_text') {
        // For open text, answer is text
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: null,
          textAnswer: answer,
          percentageValue: null
        })
      } else if (question?.questionType === 'percentage') {
        // For percentage/rating, answer is a number (1-5)
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: null,
          textAnswer: null,
          percentageValue: parseInt(answer)
        })
      } else {
        formattedAnswers.push({
          questionId: parseInt(questionId),
          selectedOptionId: null,
          textAnswer: answer,
          percentageValue: null
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
        title: "Survey Submitted",
        description: `Thank you for completing the survey! You've earned ${survey.pointsReward} points.`,
      })

      // Redirect to dashboard
      router.push("/dashboard/student")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit survey",
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
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      {/* Header with Survey Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between max-w-6xl mx-auto">
            <div className="flex items-start md:items-center gap-3 md:gap-6 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/student")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>

              <div className="flex flex-col md:flex-row md:items-center md:gap-4 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                  {survey.title}
                </h1>
                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                <p className="text-gray-600 text-sm line-clamp-3 md:line-clamp-2 md:max-w-xl mt-1 md:mt-0">
                  {survey.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center md:justify-end w-full md:w-auto self-center md:self-auto">
              <div className="flex items-center bg-emerald-100 px-3 py-1 rounded-full">
                <Award className="h-4 w-4 text-emerald-600 mr-2" />
                <span className="text-sm font-medium text-emerald-700">{survey.pointsReward} points</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 text-center">
                Question {currentQuestionIndex + 1} of {survey.questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 py-6 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Left Sidebar - Survey Details */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                {/* Progress Card */}
                <Card className="mb-6 bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">{progress}%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Started</span>
                      <span>Finished</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Survey Info Card */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-emerald-600" />
                      Survey Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-sm font-bold text-blue-600">{survey.currentParticipants}</div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <div className="text-sm font-bold text-orange-600">{survey.questions.length}</div>
                        <div className="text-xs text-gray-500">Questions</div>
                      </div>
                    </div>

                    {/* Key Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">Created by</div>
                          <div className="text-gray-500">{survey.ownerName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs">
                        <Target className="h-3 w-3 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">Target</div>
                          <div className="text-gray-500 capitalize">
                            {TARGET_GENDER_SELECT.find(g => g.value === survey.targetGender)?.label || survey.targetGender}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-xs">
                        <GraduationCap className="h-3 w-3 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">Academic Years</div>
                          <div className="text-gray-500">
                            {survey.targetAcademicYears?.map((year: number) => {
                              const found = ACADEMIC_YEARS.find(y => y.value === year)
                              return found ? found.label : year
                            }).join(", ") || "All Years"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start text-xs">
                        <Building className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">Departments</div>
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
                      <div className="text-xs font-medium mb-2">Timeline</div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-gray-500">Started: {new Date(survey.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                          <span className="text-gray-500">Ends: {new Date(survey.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Questions */}
            <div className="xl:col-span-3">
              {/* Question Card */}
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
                              Question {currentQuestionIndex + 1}
                            </span>
                            {currentQuestion.isRequired && (
                              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl text-gray-900">
                            {currentQuestion.questionText}
                          </CardTitle>
                          {currentQuestion.questionType === "multiple_choice" && (
                            <CardDescription className="mt-2 text-emerald-600">
                              💡 Select all options that apply
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
                              <DialogTitle>Help & Information</DialogTitle>
                              <DialogDescription>
                                {currentQuestion.questionType === "single_answer" && "Please select one option that best matches your opinion."}
                                {currentQuestion.questionType === "multiple_choice" && "You can select multiple options that apply."}
                                {currentQuestion.questionType === "open_text" &&
                                  "Please provide your detailed feedback in the text area. There is no character limit."}
                                {currentQuestion.questionType === "percentage" &&
                                  "Use the 1–5 rating to indicate your level of agreement or satisfaction (1 = very low, 5 = very high). You can adjust your rating before moving to the next question."}
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
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    )}
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Question Navigation Dots */}
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {survey.questions && survey.questions.length > 0 && survey.questions.map((question: any, index: number) => {
                  const canNavigate = canNavigateToQuestion(index)
                  const isAnswered = isQuestionAnswered(question.questionId)
                  const uniqueKey = question.questionId || `question-${index}`
                  
                  return (
                    <button
                      key={`nav-${uniqueKey}-${index}`}
                      onClick={() => {
                        if (canNavigate) {
                          setCurrentQuestionIndex(index)
                        } else {
                          toast({
                            title: "Cannot Navigate",
                            description: "Please answer the current question before proceeding.",
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
                      title={
                        index === currentQuestionIndex
                          ? "Current question"
                          : canNavigate
                          ? "Click to navigate"
                          : "Cannot navigate to this question"
                      }
                    />
                  )
                })}
              </div>
            </div>

              {/* Comment Section - Only show on last question */}
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
                        Leave a Comment (Optional)
                      </CardTitle>
                      <CardDescription>
                        Share your thoughts about this survey. Your comment will be visible after submission.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        placeholder="Type your comment here..." 
                        className="h-24 resize-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* JSON Preview Button - Only show on last question */}
                  <div className="mt-6 mb-3">
                    <Button 
                      onClick={() => setShowJsonDialog(true)}
                      variant="outline"
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Preview JSON Data
                    </Button>
                  </div>

                  {/* Submit Button - Only show on last question */}
                  <div className="mt-3">
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={submitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Survey
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Preview Dialog */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Survey Submission JSON Payload</DialogTitle>
            <DialogDescription>This is the JSON that will be sent to the API when you submit the survey.</DialogDescription>
          </DialogHeader>
          <pre className="bg-gray-100 rounded p-4 text-xs max-h-[60vh] overflow-auto">
            {JSON.stringify(formatSubmissionData(), null, 2)}
          </pre>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowJsonDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
