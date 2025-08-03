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
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
        title: "Error",
        description: error.message || "Failed to fetch points history",
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
          <p className="text-gray-600">Loading points history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-emerald-600" />
                <h1 className="text-xl font-semibold text-gray-900">Points History</h1>
              </div>
            </div>
            <Link href="/dashboard/student">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Current Balance</p>
                  <p className="text-2xl font-bold text-emerald-900">{currentBalance}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Earned</p>
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
                  <p className="text-sm font-medium text-red-600">Total Spent</p>
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
                  placeholder="Search transactions by description or type..."
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
              <span>Points Transaction History</span>
            </CardTitle>
            <CardDescription>
              View all your points transactions and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No matching transactions found" : "No points history yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Complete surveys to start earning points and see your transaction history here"
                  }
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/student">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Browse Available Surveys
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.historyId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.description}</h4>
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
                            {item.transactionType === 'earned' ? '+' : '-'}{item.pointsAmount} points
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
                            {item.transactionType.charAt(0).toUpperCase() + item.transactionType.slice(1)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 