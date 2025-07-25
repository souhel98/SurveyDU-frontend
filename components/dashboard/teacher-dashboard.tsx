"use client"

import React, { useState, useEffect, useMemo, ChangeEvent } from "react"
import { SurveyService } from "@/lib/services/survey-service"
import { DepartmentService } from "@/lib/services/department-service"
import { useToast } from "@/hooks/use-toast"
import {
  PlusCircle,
  BarChart2,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ACADEMIC_YEARS, TARGET_GENDER_SELECT } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    SurveyService.getTeacherSurveys()
      .then((data) => {
        setSurveys(data);
        setLoading(false);
      })
      .catch((err) => {
        toast({ title: err.message || "Failed to fetch surveys", variant: "destructive" });
        setLoading(false);
      });
    DepartmentService.getDepartments()
      .then((data) => setDepartments(data))
      .catch(() => setDepartments([]));
  }, []);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey: any) => {
      const matchesSearch =
        survey.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || survey.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [surveys, searchQuery, statusFilter]);

  const [formattedDates, setFormattedDates] = useState<{[id: string]: {createdAt: string, expiresAt: string}}>({})

  useEffect(() => {
    const newFormatted: {[id: string]: {createdAt: string, expiresAt: string}} = {};
    filteredSurveys.forEach((survey: any) => {
      newFormatted[survey.surveyId || survey.id] = {
        createdAt: survey.startDate ? new Date(survey.startDate).toLocaleDateString() : "-",
        expiresAt: survey.endDate ? new Date(survey.endDate).toLocaleDateString() : "-"
      };
    });
    setFormattedDates(newFormatted);
  }, [filteredSurveys]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <BarChart2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Responses</p>
                <h3 className="text-2xl font-bold">{surveys.reduce((acc: number, s: any) => acc + (s.currentParticipants || 0), 0)}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-[#FF9814]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Comments</p>
                <h3 className="text-2xl font-bold">-</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Settings className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Surveys</p>
                <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'active').length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search surveys..."
                className="pl-10"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Surveys</CardTitle>
            <CardDescription>Manage and analyze your created surveys</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Loading surveys...</div>
            ) : filteredSurveys.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Participants</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Target Gender</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Academic Years</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Departments</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Points Reward</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSurveys.map((survey: any, idx: number) => (
                      <tr
                        key={survey.surveyId}
                        className={`${idx === filteredSurveys.length - 1 ? '' : 'border-b'} hover:bg-gray-50`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{survey.title}</div>
                          <div className="text-sm text-gray-500">{survey.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`
                              ${survey.status === "active" ? "bg-green-50 text-green-600 border-green-200" : ""}
                              ${survey.status === "draft" ? "bg-gray-50 text-gray-600 border-gray-200" : ""}
                              ${survey.status === "expired" ? "bg-red-50 text-red-600 border-red-200" : ""}
                            `}
                          >
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{survey.currentParticipants} / {survey.requiredParticipants}</div>
                          <Progress value={survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0} className="h-2 mt-1 w-32" />
                        </td>
                        <td className="py-3 px-4">{
                          TARGET_GENDER_SELECT.find(g => g.value.toLowerCase() === String(survey.targetGender).toLowerCase())?.label || survey.targetGender
                        }</td>
                        <td className="py-3 px-4">{
                          Array.isArray(survey.targetAcademicYears)
                            ? survey.targetAcademicYears.map((year: number) => {
                                const found = ACADEMIC_YEARS.find(y => y.value === year);
                                return found ? found.label : year;
                              }).join(", ")
                            : "-"
                        }</td>
                        <td className="py-3 px-4">{
                          Array.isArray(survey.targetDepartmentIds)
                            ? survey.targetDepartmentIds.map((id: number) => {
                                const found = departments.find(dep => dep.id === id);
                                return found ? found.name : id;
                              }).join(", ")
                            : "-"
                        }</td>
                        <td className="py-3 px-4">{formattedDates[survey.surveyId]?.createdAt || "-"}</td>
                        <td className="py-3 px-4">{formattedDates[survey.surveyId]?.expiresAt || "-"}</td>
                        <td className="py-3 px-4">{survey.pointsReward}</td>
                        <td className="py-3 px-4 text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-2">
                              <button className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left">
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </button>
                              <Link href={`/surveys/${survey.surveyId}/analytics`} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded">
                                <BarChart2 className="h-4 w-4 mr-2" /> View Results
                              </Link>
                              <button className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left">
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </button>
                              <button className="flex items-center w-full px-2 py-2 hover:bg-red-100 text-red-600 rounded text-left">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </button>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No surveys found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600">Create New Survey</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
