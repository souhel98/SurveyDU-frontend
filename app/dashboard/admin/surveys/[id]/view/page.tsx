"use client"

import { useParams } from "next/navigation"
import AdminSurveyView from "@/components/dashboard/surveys/admin-survey-view"
import DashboardLayout from "@/components/dashboard-layout"

export default function SurveyViewPage() {
  const params = useParams()
  const surveyId = params.id

  return (
    <DashboardLayout>
      <AdminSurveyView surveyId={surveyId as string} />
    </DashboardLayout>
  )
} 