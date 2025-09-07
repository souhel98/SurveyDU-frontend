"use client"

import { useParams } from "next/navigation"
import SurveyView from "@/components/dashboard/surveys/survey-view"
import DashboardLayout from "@/components/dashboard-layout"

export default function SurveyViewPage() {
  const params = useParams()
  const surveyId = params.id

  return (
    <DashboardLayout>
      <SurveyView surveyId={surveyId as string} />
    </DashboardLayout>
  )
} 