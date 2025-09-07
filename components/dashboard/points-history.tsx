"use client"

import React, { useState, useEffect } from "react"
import { UserService } from "@/lib/services/user-service"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Award, 
  Search, 
  Calendar, 
  ArrowLeft,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocale } from "@/components/ui/locale-provider"

interface PointsHistoryItem {
  historyId: number
  studentId: string
  pointsAmount: number
  transactionType: string
  description: string
  transactionDate: string
  student: any
}

export default function PointsHistory() {
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useTranslation()
  const { currentLocale } = useLocale()
  const [history, setHistory] = useState<PointsHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPointsHistory()
  }, [])

  const fetchPointsHistory = async () => {
    try {
      setLoading(true)
      const response = await UserService.getStudentPointsHistory()
      if (response.success && response.data) {
        setHistory(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch points history")
      }
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error.message || t('points.failedToFetchHistory', currentLocale),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter((item) =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPointsEarned = history.filter(item => item.transactionType === 'earned').reduce((sum, item) => sum + item.pointsAmount, 0)
  const totalPointsSpent = history.filter(item => item.transactionType === 'spent').reduce((sum, item) => sum + item.pointsAmount, 0)
  const currentBalance = totalPointsEarned - totalPointsSpent

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-gray-600">{t('points.loadingHistory', currentLocale)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('points.pointsHistory', currentLocale)}</h1>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">{t('points.currentBalance', currentLocale)}</p>
                  <p className="text-2xl font-bold text-emerald-900">{currentBalance}</p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">{t('points.totalEarned', currentLocale)}</p>
                  <p className="text-2xl font-bold text-green-900">{totalPointsEarned}</p>
                </div>
                <Plus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">{t('points.totalSpent', currentLocale)}</p>
                  <p className="text-2xl font-bold text-red-900">{totalPointsSpent}</p>
                </div>
                <Minus className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('points.searchTransactions', currentLocale)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>{t('points.transactionHistory', currentLocale)}</span>
            </CardTitle>
            <CardDescription>
              {t('points.viewAllTransactions', currentLocale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? t('points.noMatchingTransactions', currentLocale) : t('points.noHistoryYet', currentLocale)}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? t('points.tryAdjustingSearch', currentLocale) 
                    : t('points.completeSurveysToEarn', currentLocale)
                  }
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/student">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      {t('dashboard.student.browseAvailableSurveys', currentLocale)}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table (lg and above) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-900`}>{t('points.transaction', currentLocale)}</th>
                        <th className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-900`}>{t('points.amount', currentLocale)}</th>
                        <th className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-900`}>{t('points.type', currentLocale)}</th>
                        <th className={`${currentLocale === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-900`}>{t('points.date', currentLocale)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item) => (
                        <tr key={item.historyId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.description.replace('Completed survey:', t('points.completedSurvey', currentLocale) + ':')}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Transaction ID: {item.historyId}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                item.transactionType === 'earned' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              {item.transactionType === 'earned' ? '+' : '-'}{item.pointsAmount} {t('points.title', currentLocale)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              variant="outline" 
                              className={`${
                                item.transactionType === 'earned' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {t(`points.${item.transactionType}`, currentLocale)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(item.transactionDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet cards (below lg) */}
                <div className="space-y-4 lg:hidden">
                  {filteredHistory.map((item) => (
                    <div key={item.historyId} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.description.replace('Completed survey:', t('points.completedSurvey', currentLocale) + ':')}</h4>
                          <p className="text-xs text-gray-500 mt-1">Transaction ID: {item.historyId}</p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${item.transactionType === 'earned' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} whitespace-nowrap ml-3`}
                        >
                          {item.transactionType === 'earned' ? '+' : '-'}{item.pointsAmount}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Badge 
                            variant="outline" 
                            className={`${item.transactionType === 'earned' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                          >
                            {t(`points.${item.transactionType}`, currentLocale)}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" /> {formatDate(item.transactionDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 