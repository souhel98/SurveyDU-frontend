import SurveyView from "@/components/surveys/survey-view"

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}

// Next.js dynamic route page for /surveys/[id]/view
export default async function Page({ params }: { params: { id: string } }) {
  return <SurveyView surveyId={params.id} />
} 