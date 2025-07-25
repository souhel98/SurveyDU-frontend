"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter, Share2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "@/components/ui/chart"

// Mock data for survey results
const surveyData = {
  id: 1,
  title: "Course Evaluation: Advanced Programming",
  totalResponses: 24,
  completionRate: 80,
  averageTime: "4m 32s",
  questions: [
    {
      id: 1,
      text: "How would you rate the overall quality of this course?",
      type: "rating",
      responses: [
        { value: "1", count: 0 },
        { value: "2", count: 1 },
        { value: "3", count: 3 },
        { value: "4", count: 12 },
        { value: "5", count: 8 },
      ],
    },
    {
      id: 2,
      text: "How clear were the course objectives?",
      type: "rating",
      responses: [
        { value: "1", count: 0 },
        { value: "2", count: 2 },
        { value: "3", count: 5 },
        { value: "4", count: 10 },
        { value: "5", count: 7 },
      ],
    },
    {
      id: 3,
      text: "Which programming languages were covered adequately?",
      type: "checkbox",
      responses: [
        { value: "JavaScript", count: 20 },
        { value: "Python", count: 18 },
        { value: "Java", count: 15 },
        { value: "C++", count: 10 },
        { value: "Ruby", count: 5 },
      ],
    },
    {
      id: 4,
      text: "What was your primary reason for taking this course?",
      type: "radio",
      responses: [
        { value: "Required for department", count: 14 },
        { value: "Interest in the subject", count: 6 },
        { value: "Reputation of instructor", count: 2 },
        { value: "Fits schedule", count: 1 },
        { value: "Other", count: 1 },
      ],
    },
  ],
  demographics: {
    academicYear: [
      { name: "First Year", value: 2 },
      { name: "Second Year", value: 5 },
      { name: "Third Year", value: 10 },
      { name: "Fourth Year", value: 7 },
    ],
    department: [
      { name: "Computer Science", value: 15 },
      { name: "Engineering", value: 5 },
      { name: "Mathematics", value: 3 },
      { name: "Other", value: 1 },
    ],
    gender: [
      { name: "Male", value: 16 },
      { name: "Female", value: 7 },
      { name: "Non-binary", value: 1 },
    ],
  },
  comments: [
    {
      id: 1,
      text: "The course was well-structured and the programming assignments were challenging but fair.",
      rating: 5,
      date: "2025-05-15",
    },
    {
      id: 2,
      text: "I would have liked more practical examples and less theory.",
      rating: 3,
      date: "2025-05-14",
    },
    {
      id: 3,
      text: "The instructor was very knowledgeable and responsive to questions.",
      rating: 5,
      date: "2025-05-13",
    },
  ],
}

// Colors for charts
const COLORS = ["#19P394", "#FF9814", "#3B82F6", "#EF4444", "#A855F7", "#EC4899"]

export default function SurveyAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedQuestion, setSelectedQuestion] = useState(surveyData.questions[0].id.toString())
  const comments = useMemo(() => surveyData?.comments || [], [surveyData?.comments]);
  const [formattedCommentDates, setFormattedCommentDates] = useState<{[id: string]: string}>({})

  useEffect(() => {
    if (!comments) return;
    const newFormatted: {[id: string]: string} = {};
    comments.forEach(comment => {
      newFormatted[comment.id] = comment.date ? new Date(comment.date).toLocaleDateString() : "-";
    });
    setFormattedCommentDates(newFormatted);
  }, [comments]);

  // Find the currently selected question
  const currentQuestion = surveyData.questions.find((q) => q.id.toString() === selectedQuestion)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{surveyData.title}</h1>
              <p className="text-gray-500">Analytics and Results</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyData.totalResponses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyData.completionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyData.averageTime}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyData.questions.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Response Summary</CardTitle>
                <CardDescription>Overview of responses by question</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={surveyData.questions
                        .filter((q) => q.type === "rating")
                        .map((q) => {
                          const avg =
                            q.responses.reduce((acc, r) => acc + Number.parseInt(r.value) * r.count, 0) /
                            q.responses.reduce((acc, r) => acc + r.count, 0)
                          return {
                            name: q.text.length > 40 ? q.text.substring(0, 40) + "..." : q.text,
                            value: Number.parseFloat(avg.toFixed(2)),
                          }
                        })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Question Analysis</CardTitle>
                <CardDescription>Detailed breakdown of responses by question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                    <SelectTrigger className="w-full md:w-[450px]">
                      <SelectValue placeholder="Select a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {surveyData.questions.map((question) => (
                        <SelectItem key={question.id} value={question.id.toString()}>
                          {question.text.length > 60 ? question.text.substring(0, 60) + "..." : question.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentQuestion && (
                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        {currentQuestion.type === "rating" ? (
                          <BarChart
                            data={currentQuestion.responses}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="value" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Responses" fill="#10b981" />
                          </BarChart>
                        ) : (
                          <BarChart
                            layout="vertical"
                            data={currentQuestion.responses}
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="value" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Responses" fill="#FF9814" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {currentQuestion.responses.map((response, index) => (
                        <Card key={index}>
                          <CardContent className="p-4 text-center">
                            <div className="text-sm font-medium text-gray-500">{response.value}</div>
                            <div className="text-xl font-bold">{response.count}</div>
                            <div className="text-xs text-gray-500">
                              {Math.round(
                                (response.count / currentQuestion.responses.reduce((acc, r) => acc + r.count, 0)) * 100,
                              )}
                              %
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Year</CardTitle>
                  <CardDescription>Distribution by academic year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={surveyData.demographics.academicYear}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {surveyData.demographics.academicYear.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department</CardTitle>
                  <CardDescription>Distribution by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={surveyData.demographics.department}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {surveyData.demographics.department.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender</CardTitle>
                  <CardDescription>Distribution by gender</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={surveyData.demographics.gender}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {surveyData.demographics.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Comments</CardTitle>
                <CardDescription>Feedback and comments from students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < comment.rating ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formattedCommentDates[comment.id] || "-"}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
