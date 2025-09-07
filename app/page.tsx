"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap, 
  BarChart2, 
  MessageSquare, 
  Award, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { AuthService } from "@/lib/services/auth-service"
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function Home2Page() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const { currentLocale, setCurrentLocale } = useLocale();
  const { t } = useTranslation();

  // Check authentication and redirect if logged in
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      try {
        if (AuthService.isAuthenticated()) {
          const user = AuthService.getCurrentUser()
          if (user) {
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

  // Animation trigger
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="flex flex-col items-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg mb-6" />
          <span className="text-gray-600 text-lg">{t('common.loading', currentLocale)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="font-bold text-lg">SurveyDU</span>
                </div>
              </Link>
            </div>

            {/* Mobile menu button and language switcher */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setCurrentLocale} />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none transition-colors"
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
            <nav className="hidden md:flex items-center space-x-6">
              <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setCurrentLocale} />
              <Link href="/auth/signin" className="text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-50">
                {t('navigation.signin', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('home.getStarted', currentLocale)}
              </Button>
            </nav>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
              <Link
                href="/auth/signin"
                className="block px-4 py-3 text-gray-600 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all duration-300"
              >
                {t('navigation.signin', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('home.getStarted', currentLocale)}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-400/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
              <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    SurveyDU
                  </span>
                  <br />
                  {t('home.hero.title', currentLocale)}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  {t('home.hero.subtitle', currentLocale)}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => router.push("/auth/student/signup")}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {t('home.hero.cta', currentLocale)}
                    {currentLocale === 'ar' ? 
                      <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" /> : 
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    }
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/signin")}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 text-lg rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-xl transition-all duration-300"
                  >
                    {t('navigation.signin', currentLocale)}
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                  <Image
                    src="/Images/what-is-a-questionnaire-blog-image-1024x618.jpg"
                    alt="Survey Platform"
                    width={600}
                    height={550}
                    className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: t('home.stats.students', currentLocale), icon: Users },
              { number: "25+", label: t('home.stats.facultyMembers', currentLocale), icon: GraduationCap },
              { number: "50+", label: t('home.stats.surveysCreated', currentLocale), icon: BarChart2 },
              { number: "1,200+", label: t('home.stats.responses', currentLocale), icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className={`text-center transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl inline-block mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('home.features.title', currentLocale)} <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">SurveyDU</span>{currentLocale === 'ar' ? ' ؟ ': ' ?' } 
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.features.subtitle', currentLocale)}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: t('home.features.easyToUse.title', currentLocale),
                description: t('home.features.easyToUse.description', currentLocale),
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Shield,
                title: t('home.features.secure.title', currentLocale),
                description: t('home.features.secure.description', currentLocale),
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: BarChart2,
                title: t('home.features.simpleReports.title', currentLocale),
                description: t('home.features.simpleReports.description', currentLocale),
                color: "from-emerald-500 to-teal-600"
              }
            ].map((feature, index) => (
              <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                <CardHeader className="text-center">
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('home.howItWorks.title', currentLocale)} <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{t('home.howItWorks.works', currentLocale)}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.howItWorks.subtitle', currentLocale)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Students */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl mr-5">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{t('home.howItWorks.forStudents', currentLocale)}</h3>
              </div>
              <div className="space-y-6">
                {[
                  t('home.howItWorks.studentSteps.signUp', currentLocale),
                  t('home.howItWorks.studentSteps.takeSurveys', currentLocale),
                  t('home.howItWorks.studentSteps.provideFeedback', currentLocale),
                  t('home.howItWorks.studentSteps.helpImprove', currentLocale)
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Faculty */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl mr-5">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{t('home.howItWorks.forFaculty', currentLocale)}</h3>
              </div>
              <div className="space-y-6">
                {[
                  t('home.howItWorks.facultySteps.getAccess', currentLocale),
                  t('home.howItWorks.facultySteps.createSurveys', currentLocale),
                  t('home.howItWorks.facultySteps.sendSurveys', currentLocale),
                  t('home.howItWorks.facultySteps.viewResults', currentLocale)
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('home.cta.title', currentLocale)}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('home.cta.subtitle', currentLocale)}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => router.push("/auth/student/signup")}
              className="bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('home.cta.getStartedFree', currentLocale)}
            </Button>
            <Button
              onClick={() => router.push("/auth/signin")}
              className="bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('navigation.signin', currentLocale)}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl inline-block mb-6">
              <span className="font-bold text-lg">SurveyDU</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('home.footer.description', currentLocale)}
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                {t('navigation.home', currentLocale)}
              </Link>
              <Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors">
                {t('navigation.signin', currentLocale)}
              </Link>
              <Link href="/auth/student/signup" className="text-gray-400 hover:text-white transition-colors">
                {t('navigation.signup', currentLocale)}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 