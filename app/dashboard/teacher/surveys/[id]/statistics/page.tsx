"use client"

import { use } from "react"
import SurveyStatistics from "@/components/dashboard/surveys/survey-statistics"

export default function SurveyStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <SurveyStatistics surveyId={id} />
} 