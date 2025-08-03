"use client"

import { useParams } from "next/navigation"
import SurveyParticipation from "@/components/dashboard/surveys/survey-participation"

export default function StudentSurveyPage() {
  const params = useParams()
  const surveyId = params.id

  return <SurveyParticipation surveyId={surveyId as string} />
} 