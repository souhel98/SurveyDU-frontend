"use client"

import { useParams } from "next/navigation"
import SurveyParticipation from "@/components/dashboard/surveys/survey-participation"
import DashboardLayout from "@/components/dashboard-layout"

export default function StudentSurveyPage() {
  const params = useParams()
  const surveyId = params.id

  return (
    <DashboardLayout>
      <SurveyParticipation surveyId={surveyId as string} />
    </DashboardLayout>
  )
} 