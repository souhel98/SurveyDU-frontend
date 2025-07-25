import SurveyAnalytics from "@/components/analytics/survey-analytics"
import Link from "next/link"

// Mock surveys data - in a real app, this would come from your database or API
const surveys = [
  { id: '1', title: "Student Satisfaction Survey" },
  { id: '2', title: "Course Feedback: Introduction to Programming" },
  { id: '3', title: "Campus Facilities Evaluation" },
  { id: '4', title: "Library Services Feedback" },
  { id: '5', title: "Student Mental Health Assessment" },
  { id: '6', title: "Course Evaluation: Advanced Programming" },
  { id: '7', title: "Teaching Methods Feedback" },
  { id: '8', title: "Laboratory Equipment Assessment" },
  { id: '9', title: "Research Project Interest Survey" },
  { id: '10', title: "Academic Resources Evaluation" }
]

export function generateStaticParams() {
  // Return an array of objects with the id parameter for each survey
  return surveys.map((survey) => ({
    id: survey.id
  }))
}

export default function SurveyAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/teacher" className="flex items-center">
                <div className="bg-emerald-500 text-white p-2 rounded-md mr-2">
                  <span className="font-bold">SurveyDU</span>
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Survey Analytics</h1>
                <p className="text-gray-500">View analytics and results for this survey</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <SurveyAnalytics />
      </main>
    </div>
  )
}
