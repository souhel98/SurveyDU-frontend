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

export default function SignIn() {
  const router = useRouter()
  const { toast } = useToast()
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
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        setVisibleError("Please fill in all required fields.")
        return
      }
      const credentials = {
        Email: formData.email,
        Password: formData.password
      }
      const user = await AuthService.login(credentials)
      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${user.email}`,
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
      setVisibleError(error.message || "Login failed. Please try again.")
      toast({
        title: "Login Failed",
        description: error.message || "Login failed. Please try again.",
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
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="font-bold text-lg">SurveyDU</span>
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
              <Link href="/" className="text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-50">
                Home
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign Up
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
                Home
              </Link>
              <Button
                onClick={() => router.push("/auth/student/signup")}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-emerald-600 hover:underline ml-auto">Forgot password?</Link>
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
                  className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/student/signup"
              className="text-emerald-500 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}
