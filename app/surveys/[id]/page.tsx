import SurveyParticipation from "@/components/surveys/survey-participation"

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}

// Next.js dynamic route page for /surveys/[id]
export default function Page({ params }: { params: { id: string } }) {
  return <SurveyParticipation surveyId={params.id} />
}
