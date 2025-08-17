"use client"

import { use } from "react"
import AdminSurveyStatistics from "@/components/dashboard/surveys/admin-survey-statistics"

export default function SurveyStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AdminSurveyStatistics surveyId={id} />
} 