"use client"

import { use } from "react"
import AdminSurveyStatistics from "@/components/dashboard/surveys/admin-survey-statistics"
import DashboardLayout from "@/components/dashboard-layout"

export default function SurveyStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <DashboardLayout>
      <AdminSurveyStatistics surveyId={id} />
    </DashboardLayout>
  )
} 