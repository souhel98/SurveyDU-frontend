"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Award, ChevronLeft, ChevronRight, Clock, HelpCircle, MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

// Mock survey data
const surveyData = {
  id: 1,
  title: "Student Satisfaction Survey",
  description: "Help us improve your university experience by providing feedback on various aspects of campus life.",
  department: "Administration",
  points: 50,
  estimatedTime: "10 min",
  questions: [
    {
      id: 1,
      text: "How satisfied are you with the quality of teaching at the university?",
      type: "radio",
      required: true,
      options: [
        { id: 1, text: "Very Dissatisfied" },
        { id: 2, text: "Dissatisfied" },
        { id: 3, text: "Neutral" },
        { id: 4, text: "Satisfied" },
        { id: 5, text: "Very Satisfied" },
      ],
    },
    {
      id: 2,
      text: "How would you rate the availability of academic resources (library, online resources, etc.)?",
      type: "radio",
      required: true,
      options: [
        { id: 1, text: "Very Poor" },
        { id: 2, text: "Poor" },
        { id: 3, text: "Average" },
        { id: 4, text: "Good" },
        { id: 5, text: "Excellent" },
      ],
    },
    {
      id: 3,
      text: "Which campus facilities do you use regularly? (Select all that apply)",
      type: "checkbox",
      required: false,
      options: [
        { id: 1, text: "Library" },
        { id: 2, text: "Cafeteria" },
        { id: 3, text: "Gym/Sports Facilities" },
        { id: 4, text: "Study Rooms" },
        { id: 5, text: "Computer Labs" },
        { id: 6, text: "Student Lounge" },
      ],
    },
    {
      id: 4,
      text: "What aspects of student life would you like to see improved? (Select all that apply)",
      type: "checkbox",
      required: false,
      options: [
        { id: 1, text: "Academic Support" },
        { id: 2, text: "Campus Events" },
        { id: 3, text: "Housing" },
        { id: 4, text: "Dining Options" },
        { id: 5, text: "Transportation" },
        { id: 6, text: "Career Services" },
      ],
    },
    {
      id: 5,
      text: "How likely are you to recommend this university to a friend or colleague?",
      type: "radio",
      required: true,
      options: [
        { id: 1, text: "Not at all likely" },
        { id: 2, text: "Slightly likely" },
        { id: 3, text: "Moderately likely" },
        { id: 4, text: "Very likely" },
        { id: 5, text: "Extremely likely" },
      ],
    },
    {
      id: 6,
      text: "Please provide any additional comments or suggestions for improving your university experience.",
      type: "textarea",
      required: false,
    },
  ],
}

interface SurveyParticipationProps {
  surveyId?: string | number;
}

export default function SurveyParticipation({ surveyId }: SurveyParticipationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [comment, setComment] = useState("")

  const currentQuestion = surveyData.questions[currentQuestionIndex]
  const progress = Math.round(((currentQuestionIndex + 1) / surveyData.questions.length) * 100)

  // For now, just log or display the surveyId for development
  console.log('Survey ID:', surveyId);

  const handleNextQuestion = () => {
    // Check if current question is required and not answered
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast({
        title: "Required Question",
        description: "Please answer this question before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (currentQuestionIndex < surveyData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowSubmitDialog(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleRadioChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleCheckboxChange = (optionId: number) => {
    const currentAnswer = answers[currentQuestion.id] || []
    const updatedAnswer = currentAnswer.includes(optionId)
      ? currentAnswer.filter((id: number) => id !== optionId)
      : [...currentAnswer, optionId]

    setAnswers({ ...answers, [currentQuestion.id]: updatedAnswer })
  }

  const handleTextareaChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleSubmitSurvey = () => {
    // In a real app, you would submit the answers to your API
    console.log("Survey submitted:", answers)

    // Show success toast
    toast({
      title: "Survey Submitted",
      description: `Thank you for completing the survey! You've earned ${surveyData.points} points.`,
    })

    // Redirect to dashboard
    router.push("/dashboard/student")
  }

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case "radio":
        return (
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleRadioChange}
            className="space-y-3 mt-4"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-3 mt-4">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={(answers[currentQuestion.id] || []).includes(option.id)}
                  onCheckedChange={() => handleCheckboxChange(option.id)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <Label 
                  htmlFor={`option-${option.id}`} 
                  className="cursor-pointer select-none"
                  onClick={() => handleCheckboxChange(option.id)}
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )

      case "textarea":
        return (
          <Textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleTextareaChange(e.target.value)}
            placeholder="Type your answer here..."
            className="mt-4 h-32"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Survey Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{surveyData.title}</h1>
          <p className="text-gray-500 mt-1">{surveyData.description}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Award className="h-4 w-4 mr-1 text-[#FF9814]" />
              <span>{surveyData.points} points upon completion</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Estimated time: {surveyData.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {surveyData.questions.length}
            </span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {currentQuestion.text}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </CardTitle>
                    {currentQuestion.type === "checkbox" && (
                      <CardDescription>Select all that apply</CardDescription>
                    )}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Help & Information</DialogTitle>
                    <DialogDescription>
                      {currentQuestion.type === "radio" && "Please select one option that best matches your opinion."}
                      {currentQuestion.type === "checkbox" && "You can select multiple options that apply."}
                      {currentQuestion.type === "textarea" &&
                        "Please provide your detailed feedback in the text area. There is no character limit."}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>{renderQuestionContent()}</CardContent>
          <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousQuestion} 
                  disabled={currentQuestionIndex === 0}
                  className="w-[100px]"
                >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
                <div className="flex-1 flex justify-center">
                  <div className="flex gap-1">
                    {surveyData.questions.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === currentQuestionIndex
                            ? "bg-emerald-500"
                            : index < currentQuestionIndex
                            ? "bg-emerald-200"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleNextQuestion}
                  className="w-[100px]"
                >
              {currentQuestionIndex < surveyData.questions.length - 1 ? (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                    <>
                      Submit <ChevronRight className="ml-2 h-4 w-4" />
                    </>
              )}
            </Button>
          </CardFooter>
        </Card>
          </motion.div>
        </AnimatePresence>

        {/* Comment Section - Only show on last question */}
        {currentQuestionIndex === surveyData.questions.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Leave a Comment (Optional)
            </CardTitle>
            <CardDescription>
                  Share your thoughts about this survey. Your comment will be visible after submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
                <Textarea 
                  placeholder="Type your comment here..." 
                  className="h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
          </CardContent>
        </Card>
          </motion.div>
        )}
      </div>

        {/* Submit Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Survey</DialogTitle>
              <DialogDescription>
              Are you sure you want to submit your responses? You won't be able to change them after submission.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Review Answers
              </Button>
              <Button onClick={handleSubmitSurvey} className="bg-emerald-500 hover:bg-emerald-600">
                Submit Survey
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
