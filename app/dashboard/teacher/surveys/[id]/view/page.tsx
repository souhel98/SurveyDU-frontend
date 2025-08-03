"use client"

import { useParams } from "next/navigation"
import SurveyView from "@/components/dashboard/surveys/survey-view"

export default function SurveyViewPage() {
  const params = useParams()
  const surveyId = params.id

  return <SurveyView surveyId={surveyId as string} />
} 