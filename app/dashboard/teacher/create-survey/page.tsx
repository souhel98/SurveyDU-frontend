import DashboardLayout from "@/components/dashboard-layout"
import SurveyCreator from "@/components/dashboard/surveys/survey-creator"

export default function Home() {
  // In a real app, you would check authentication here
  // If not authenticated, redirect to role selection page
  // const isAuthenticated = checkAuth();
  // if (!isAuthenticated) {
  //   redirect("/role-selection");
  // }

  return (
    <DashboardLayout>
      <SurveyCreator />
    </DashboardLayout>
  )
}
