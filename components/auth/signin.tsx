"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/services/auth-service"
import { Eye, EyeOff } from "lucide-react"
import GoogleLogin from "./GoogleLogin"
import LanguageSwitcher from "@/components/ui/language-switcher"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocale } from "@/components/ui/locale-provider"

export default function SignIn() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { currentLocale, setCurrentLocale } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [visibleError, setVisibleError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const initialFormData = { email: "", password: "" };
  const isDirty = formData.email !== initialFormData.email || formData.password !== initialFormData.password;

  // Function to translate error messages
  const translateError = (errorMessage: string) => {
    if (errorMessage.includes('Invalid email or password')) {
      return t('auth.invalidCredentials', currentLocale)
    } else if (errorMessage.includes('Invalid request')) {
      return t('auth.invalidRequest', currentLocale)
    } else if (errorMessage.includes('Server error')) {
      return t('auth.serverError', currentLocale)
    } else if (errorMessage.includes('Request timeout')) {
      return t('auth.requestTimeout', currentLocale)
    } else if (errorMessage.includes('Network error')) {
      return t('auth.networkError', currentLocale)
    } else if (errorMessage.includes('Login failed')) {
      return t('auth.loginFailed', currentLocale)
    }
    return errorMessage // Return original message if no translation found
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    setVisibleError(null)
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired', currentLocale)
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validEmailRequired', currentLocale)
    }
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired', currentLocale)
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    setIsLoading(true)
    setVisibleError(null)
    try {
      if (!validateForm()) {
        toast({
          title: t('auth.validationError', currentLocale),
          description: t('auth.fillAllFields', currentLocale),
          variant: "destructive",
        })
        setVisibleError(t('auth.fillAllFields', currentLocale))
        return
      }
      const credentials = {
        Email: formData.email,
        Password: formData.password
      }
      const user = await AuthService.login(credentials)
      toast({
        title: t('auth.welcomeBack', currentLocale),
        description: t('auth.successfullySignedIn', currentLocale).replace('{email}', user.email),
      })
      // Redirect based on user type
      if (user.userType === 'Admin') {
        router.push('/dashboard/admin')
      } else if (user.userType === 'Teacher') {
        router.push('/dashboard/teacher')
      } else {
        router.push('/dashboard/student')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const translatedError = translateError(error.message || t('auth.loginFailed', currentLocale))
      setVisibleError(translatedError)
      toast({
        title: t('auth.loginFailed', currentLocale),
        description: translatedError,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2 sm:p-3 rounded-xl mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="font-bold text-base sm:text-lg">SurveyDU</span>
                </div>
              </Link>
            </div>

            {/* Mobile navigation */}
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
              <Link href="/" className="text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-50">
                {t('navigation.home', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('navigation.signup', currentLocale)}
              </Button>
            </nav>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-300">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-600 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all duration-300"
              >
                {t('navigation.home', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('navigation.signup', currentLocale)}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.signIn', currentLocale)}</CardTitle>
          <CardDescription>{t('auth.signInDescription', currentLocale)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email', currentLocale)}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={errors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('auth.password', currentLocale)}</Label>
                <Link href="/auth/forgot-password" className={`text-xs text-emerald-600 hover:underline ${currentLocale === 'ar' ? 'mr-auto' : 'ml-auto'}`}>{t('auth.forgotPassword', currentLocale)}</Link>
              </div>
              <div className="relative">
              <Input
                id="password"
                name="password"
                  type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                  disabled={isLoading}
                  className={`${errors.password ? "border-red-500 focus:border-red-500" : ""} `}
                />
                <button
                  type="button"
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none ${currentLocale === 'ar' ? 'left-3' : 'right-3'}`}
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? t('auth.hidePassword', currentLocale) : t('auth.showPassword', currentLocale)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            {visibleError && (
              <div className="text-sm text-red-600 text-center font-medium">{visibleError}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              disabled={!isDirty || isLoading}
            >
              {isLoading ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : null}
              {isLoading ? t('auth.signingIn', currentLocale) : t('auth.signIn', currentLocale)}
            </Button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">{t('auth.or', currentLocale)}</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <GoogleLogin />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {t('auth.noAccount', currentLocale)}{" "}
            <Link
              href="/auth/student/signup"
              className="text-emerald-500 hover:underline"
            >
              {t('navigation.signup', currentLocale)}
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}
