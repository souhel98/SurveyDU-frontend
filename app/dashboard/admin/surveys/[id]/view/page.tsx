"use client"

import { useParams } from "next/navigation"
import AdminSurveyView from "@/components/dashboard/surveys/admin-survey-view"

export default function SurveyViewPage() {
  const params = useParams()
  const surveyId = params.id

  return <AdminSurveyView surveyId={surveyId as string} />
} 