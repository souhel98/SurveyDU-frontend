"use client"

import { use } from "react"
import SurveyStatistics from "@/components/dashboard/surveys/survey-statistics"
import DashboardLayout from "@/components/dashboard-layout"

export default function SurveyStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <DashboardLayout>
      <SurveyStatistics surveyId={id} />
    </DashboardLayout>
  )
} 