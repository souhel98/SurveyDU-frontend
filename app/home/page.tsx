"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronRight, ChevronLeft, GraduationCap, BarChart2, MessageSquare, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { AuthService } from "@/lib/services/auth-service"
import { useLocale } from "@/components/ui/locale-provider"
import { useTranslation } from "@/hooks/useTranslation"

export default function LandingPage() {
const router = useRouter()
const [isMenuOpen, setIsMenuOpen] = useState(false)
const [isLoading, setIsLoading] = useState(true)
const { currentLocale } = useLocale()
const { t } = useTranslation()

// Check authentication and redirect if logged in
// If user is already logged in, they will be automatically redirected to their dashboard
useEffect(() => {
  const checkAuthAndRedirect = () => {
    try {
      // Check if user is authenticated
      if (AuthService.isAuthenticated()) {
        const user = AuthService.getCurrentUser()
        if (user) {
          // Redirect based on user type
          if (user.userType === 'Admin') {
            router.replace('/dashboard/admin')
          } else if (user.userType === 'Teacher') {
            router.replace('/dashboard/teacher')
          } else {
            router.replace('/dashboard/student')
          }
          return
        }
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsLoading(false)
    }
  }

  checkAuthAndRedirect()
}, [router])

// Show loading spinner while checking authentication
if (isLoading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg mb-6" />
        <span className="text-gray-600 text-lg">Checking authentication...</span>
      </div>
    </div>
  )
}

return (
    <div className="min-h-screen flex flex-col">
    {/* Navigation */}
    <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
            <Link href="/" className="flex items-center">
                <div className="bg-emerald-500 text-white p-2 rounded-md mr-2">
                <span className="font-bold">SurveyDU</span>
                </div>
            </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
                </svg>
            </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-emerald-500 px-3 py-2">
                Sign In
            </Link>
            <Button
                onClick={() => router.push("/auth/student/signup")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
                Get Started
            </Button>
            </nav>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
            <div className="md:hidden mt-3 pb-3">
            <Link
                href="/auth/signin"
                className="block px-3 py-2 text-gray-600 hover:text-emerald-500 hover:bg-gray-50 rounded-md"
            >
                Sign In
            </Link>
            <Button
                onClick={() => router.push("/auth/student/signup")}
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
                Get Started
            </Button>
            </div>
        )}
        </div>
    </header>

    {/* Hero Section */}
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Connecting University Voices Through Surveys
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Create, participate, and analyze surveys to improve the university experience for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                onClick={() => router.push("/auth/student/signup")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
                >
                Get Started {currentLocale === 'ar' ? <ChevronLeft className="mr-2 h-5 w-5" /> : <ChevronRight className="ml-2 h-5 w-5" />}
                </Button>
                <Button
                variant="outline"
                onClick={() => router.push("/auth/signin")}
                className="border-gray-300 text-gray-700 px-8 py-6 text-lg"
                >
                Sign In
                </Button>
            </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
            <Image
                src="/Images/what-is-a-questionnaire-blog-image-1024x618.jpg"
                alt="Questionnaire"
                width={600}
                height={550}
                className="rounded-lg shadow-lg"
            />
            </div>
        </div>
        </div>
    </section>

    {/* Features Section */}
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use UniSurvey?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it easy to gather and analyze feedback, improving communication between students and
            faculty.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <Card>
            <CardHeader>
                <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle>Powerful Analytics</CardTitle>
                <CardDescription>
                Gain valuable insights with comprehensive analytics and visualization tools.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">
                Transform survey responses into actionable data with our intuitive analytics dashboard. Track
                participation rates, identify trends, and export results for further analysis.
                </p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-[#FF9814]" />
                </div>
                <CardTitle>Seamless Feedback</CardTitle>
                <CardDescription>
                Facilitate open communication between students and faculty through moderated comments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">
                Enable constructive dialogue with our comment system. Teachers can moderate feedback to ensure a
                respectful environment while students can share their thoughts openly.
                </p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Engagement Rewards</CardTitle>
                <CardDescription>Motivate participation with a points-based reward system.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">
                Encourage survey participation through gamification. Students earn points for completing surveys,
                which can be redeemed for university perks or recognition.
                </p>
            </CardContent>
            </Card>
        </div>
        </div>
    </section>

    {/* How It Works Section */}
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform serves both students and teachers with tailored experiences.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <GraduationCap className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
            </div>
            <ol className="space-y-6">
                <li className="flex">
                <span className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Create Your Profile</h4>
                    <p className="text-gray-600">Sign up with your university credentials and complete your profile.</p>
                </div>
                </li>
                <li className="flex">
                <span className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Browse Available Surveys</h4>
                    <p className="text-gray-600">
                    Find relevant surveys from your courses, departments, or university administration.
                    </p>
                </div>
                </li>
                <li className="flex">
                <span className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Participate & Earn Points</h4>
                    <p className="text-gray-600">
                    Complete surveys to provide valuable feedback and earn points for your participation.
                    </p>
                </div>
                </li>
            </ol>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-6">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                <BookOpen className="h-8 w-8 text-[#FF9814]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Teachers</h3>
            </div>
            <ol className="space-y-6">
                <li className="flex">
                <span className="bg-orange-100 text-[#FF9814] rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    1
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Create Your Account</h4>
                    <p className="text-gray-600">Register as a faculty member through the designated website administrator and verify your teaching qualifications.</p>
                </div>
                </li>
                <li className="flex">
                <span className="bg-orange-100 text-[#FF9814] rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    2
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Design Custom Surveys</h4>
                    <p className="text-gray-600">
                    Create tailored surveys with our intuitive builder to gather specific feedback.
                    </p>
                </div>
                </li>
                <li className="flex">
                <span className="bg-orange-100 text-[#FF9814] rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                    3
                </span>
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Analyze Results & Moderate Comments</h4>
                    <p className="text-gray-600">
                    Review survey analytics and manage student comments to gain actionable insights.
                    </p>
                </div>
                </li>
            </ol>
            </div>
        </div>
        </div>
    </section>

    {/* Statistics Section */}
    <section className="py-16 bg-emerald-500 text-white">
        <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
            <div className="text-4xl font-bold mb-2">1,200+</div>
            <div className="text-emerald-100">Active Users</div>
            </div>
            <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-emerald-100">Surveys Created</div>
            </div>
            <div>
            <div className="text-4xl font-bold mb-2">15,000+</div>
            <div className="text-emerald-100">Responses Collected</div>
            </div>
            <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-emerald-100">Satisfaction Rate</div>
            </div>
        </div>
        </div>
    </section>

    {/* CTA Section */}
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join our university survey platform today and be part of improving the educational experience.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
            onClick={() => router.push("/auth/student/signup")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
            >
            Create Account
            </Button>
            <Button
            variant="outline"
            onClick={() => router.push("/auth/signin")}
            className="border-gray-300 text-gray-700 px-8 py-6 text-lg"
            >
            Sign In
            </Button>
        </div>
        </div>
    </section>
    </div>
)
} 