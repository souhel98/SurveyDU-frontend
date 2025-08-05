"use client"

import React, { useState, useEffect, useMemo, ChangeEvent } from "react"
import { SurveyService } from "@/lib/services/survey-service"
import { DepartmentService } from "@/lib/services/department-service"
import { useToast } from "@/hooks/use-toast"
import {
  PlusCircle,
  BarChart2,
  BarChart3,
  Settings,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  User,
  FileText,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  Building,
  GraduationCap,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ACADEMIC_YEARS, TARGET_GENDER_SELECT, SURVEY_STATUS_LABELS } from "@/lib/constants"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [duplicatingSurveyId, setDuplicatingSurveyId] = useState<number | null>(null);
  const [publishingSurveyId, setPublishingSurveyId] = useState<number | null>(null);
  const [unpublishingSurveyId, setUnpublishingSurveyId] = useState<number | null>(null);
  const [showSurveysWithResponses, setShowSurveysWithResponses] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Quick edit states
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{
    startDate: string;
    endDate: string;
    requiredParticipants: number;
  }>({
    startDate: "",
    endDate: "",
    requiredParticipants: 0
  });
  const [updatingSurveyId, setUpdatingSurveyId] = useState<number | null>(null);
  const [refreshingSurveys, setRefreshingSurveys] = useState(false);
  const [quickEditDialogOpen, setQuickEditDialogOpen] = useState(false);

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
    let filtered = surveys.filter((survey: any) => {
      const matchesSearch =
        survey.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || survey.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Apply active filter based on button clicked
    if (activeFilter === "responses") {
      filtered = filtered.filter((survey: any) => (survey.currentParticipants || 0) > 0);
    } else if (activeFilter === "active") {
      filtered = filtered.filter((survey: any) => survey.status === "active");
    } else if (activeFilter === "draft") {
      filtered = filtered.filter((survey: any) => survey.status === "draft");
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((survey: any) => survey.status === "inactive");
    } else if (activeFilter === "expired") {
      filtered = filtered.filter((survey: any) => survey.status === "expired");
    } else if (activeFilter === "completed") {
      filtered = filtered.filter((survey: any) => survey.status === "completed");
    }

    return filtered;
  }, [surveys, searchQuery, statusFilter, activeFilter]);

  const [formattedDates, setFormattedDates] = useState<{[id: string]: {createdAt: string, expiresAt: string}}>({})

  useEffect(() => {
    const newFormatted: {[id: string]: {createdAt: string, expiresAt: string}} = {};
    filteredSurveys.forEach((survey: any) => {
      newFormatted[survey.surveyId || survey.id] = {
        createdAt: survey.startDate ? new Date(survey.startDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -') : "-",
        expiresAt: survey.endDate ? new Date(survey.endDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -') : "-"
      };
    });
    setFormattedDates(newFormatted);
  }, [filteredSurveys]);

  const handleDuplicateSurvey = async (surveyId: number) => {
    try {
      setDuplicatingSurveyId(surveyId);
      const duplicatedSurvey = await SurveyService.duplicateTeacherSurvey(surveyId);
      
      toast({
        title: "Success",
        description: "Survey duplicated successfully!",
      })
      
      // Refresh the surveys list
      const updatedSurveys = await SurveyService.getTeacherSurveys();
      setSurveys(updatedSurveys);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate survey",
        variant: "destructive"
      })
    } finally {
      setDuplicatingSurveyId(null);
    }
  };

  const handlePublishSurvey = async (surveyId: number) => {
    try {
      setPublishingSurveyId(surveyId);
      await SurveyService.publishTeacherSurvey(surveyId);
      
      toast({
        title: "Success",
        description: "Survey published successfully!",
      })
      
      // Refresh the surveys list
      const updatedSurveys = await SurveyService.getTeacherSurveys();
      setSurveys(updatedSurveys);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish survey",
        variant: "destructive"
      })
    } finally {
      setPublishingSurveyId(null);
    }
  };

  const handleUnpublishSurvey = async (surveyId: number) => {
    try {
      setUnpublishingSurveyId(surveyId);
      await SurveyService.unpublishTeacherSurvey(surveyId);
      
      toast({
        title: "Success",
        description: "Survey unpublished successfully and returned to draft status!",
      })
      
      // Refresh the surveys list
      const updatedSurveys = await SurveyService.getTeacherSurveys();
      setSurveys(updatedSurveys);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unpublish survey",
        variant: "destructive"
      })
    } finally {
      setUnpublishingSurveyId(null);
    }
  };

  // Quick edit functions
  const handleStartEdit = (survey: any) => {
    setEditingSurveyId(survey.surveyId);
    setEditingData({
      startDate: survey.startDate ? new Date(survey.startDate).toISOString().split('T')[0] : "",
      endDate: survey.endDate ? new Date(survey.endDate).toISOString().split('T')[0] : "",
      requiredParticipants: survey.requiredParticipants || 0
    });
    setQuickEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingSurveyId(null);
    setEditingData({
      startDate: "",
      endDate: "",
      requiredParticipants: 0
    });
    setQuickEditDialogOpen(false);
  };

  const handleSaveEdit = async (surveyId: number) => {
    try {
      setUpdatingSurveyId(surveyId);
      
      // Validate required participants
      if (editingData.requiredParticipants <= 0) {
        toast({
          title: "Error",
          description: "Required participants must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      // Validate dates
      if (editingData.startDate && editingData.endDate) {
        const startDate = new Date(editingData.startDate);
        const endDate = new Date(editingData.endDate);
        
        if (startDate >= endDate) {
          toast({
            title: "Error",
            description: "End date must be after start date",
            variant: "destructive"
          });
          return;
        }
      }

      // Prepare the update data with proper formatting
      const updateData: any = {
        requiredParticipants: editingData.requiredParticipants
      };

      // Get the current survey to check if it's active, expired, or completed with participants
      const currentSurvey = surveys.find(s => s.surveyId === surveyId);
      const isActiveWithParticipants = currentSurvey?.status === 'active' && currentSurvey?.currentParticipants > 0;
      const isExpiredWithParticipants = currentSurvey?.status === 'expired' && currentSurvey?.currentParticipants > 0;
      const isCompletedWithParticipants = currentSurvey?.status === 'completed' && currentSurvey?.currentParticipants > 0;
      const isInactive = currentSurvey?.status === 'inactive';
      const hasParticipants = isActiveWithParticipants || isExpiredWithParticipants || isCompletedWithParticipants;

      // Only include dates if they are provided and allowed
      if (editingData.endDate) {
        updateData.endDate = editingData.endDate;
      }
      
      // Include start date if survey doesn't have participants OR is inactive
      if (editingData.startDate && (!hasParticipants || isInactive)) {
        updateData.startDate = editingData.startDate;
      }

      await SurveyService.updateTeacherSurveyDates(surveyId, updateData);
      
      toast({
        title: "Success",
        description: "Survey updated successfully!",
      });
      
      // Refresh the surveys list
      setRefreshingSurveys(true);
      const updatedSurveys = await SurveyService.getTeacherSurveys();
      setSurveys(updatedSurveys);
      setRefreshingSurveys(false);
      
      // Exit edit mode
      setEditingSurveyId(null);
      setEditingData({
        startDate: "",
        endDate: "",
        requiredParticipants: 0
      });
      setQuickEditDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update survey",
        variant: "destructive"
      });
    } finally {
      setUpdatingSurveyId(null);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 mb-6">
          {/* First Row - Total Responses and Total Surveys */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-full mr-4">
                      <BarChart2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Responses</p>
                      <h3 className="text-2xl font-bold">{surveys.reduce((acc: number, s: any) => acc + (s.currentParticipants || 0), 0)}</h3>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                  onClick={() => setActiveFilter(activeFilter === "responses" ? null : "responses")}
                >
                  <BarChart3 className="h-4 w-4" />
                  {activeFilter === "responses" ? "Show All" : "View Responses"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Surveys</p>
                      <h3 className="text-2xl font-bold">{surveys.length}</h3>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  onClick={() => setActiveFilter(activeFilter === "all" ? null : "all")}
                >
                  <FileText className="h-4 w-4" />
                  {activeFilter === "all" ? "Show All Surveys" : "View All Surveys"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Status Cards */}
          <div className="grid gap-4 md:grid-cols-5">

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Play className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Surveys</p>
                    <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'active').length}</h3>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                onClick={() => setActiveFilter(activeFilter === "active" ? null : "active")}
              >
                <Play className="h-4 w-4" />
                {activeFilter === "active" ? "Show All Surveys" : "View Active Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Draft Surveys</p>
                    <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'draft').length}</h3>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                onClick={() => setActiveFilter(activeFilter === "draft" ? null : "draft")}
              >
                <Clock className="h-4 w-4" />
                {activeFilter === "draft" ? "Show All Surveys" : "View Draft Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inactive Surveys</p>
                    <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'inactive').length}</h3>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                onClick={() => setActiveFilter(activeFilter === "inactive" ? null : "inactive")}
              >
                <AlertCircle className="h-4 w-4" />
                {activeFilter === "inactive" ? "Show All Surveys" : "View Inactive Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expired Surveys</p>
                    <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'expired').length}</h3>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                onClick={() => setActiveFilter(activeFilter === "expired" ? null : "expired")}
              >
                <Clock className="h-4 w-4" />
                {activeFilter === "expired" ? "Show All Surveys" : "View Expired Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <CheckCircle className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Surveys</p>
                    <h3 className="text-2xl font-bold">{surveys.filter((s: any) => s.status === 'completed').length}</h3>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700"
                onClick={() => setActiveFilter(activeFilter === "completed" ? null : "completed")}
              >
                <CheckCircle className="h-4 w-4" />
                {activeFilter === "completed" ? "Show All Surveys" : "View Completed Surveys"}
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your surveys and view analytics</p>
          </div>
          <Link href="/dashboard/teacher/create-survey">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Survey
            </Button>
          </Link>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        {activeFilter ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeFilter === "responses" && "Surveys with Responses"}
                  {activeFilter === "all" && "All Surveys"}
                  {activeFilter === "active" && "Active Surveys"}
                  {activeFilter === "draft" && "Draft Surveys"}
                  {activeFilter === "inactive" && "Inactive Surveys"}
                  {activeFilter === "expired" && "Expired Surveys"}
                  {activeFilter === "completed" && "Completed Surveys"}
                </h2>
                <p className="text-gray-600">
                  {activeFilter === "responses" && "Surveys that have received responses from participants"}
                  {activeFilter === "all" && "All surveys created by you"}
                  {activeFilter === "active" && "Surveys that are currently active and accepting responses"}
                  {activeFilter === "draft" && "Surveys that are in draft status and not yet published"}
                  {activeFilter === "inactive" && "Surveys that are inactive and not accepting responses"}
                  {activeFilter === "expired" && "Surveys that have passed their end date and are no longer accepting responses"}
                  {activeFilter === "completed" && "Surveys that have been completed and are no longer accepting responses"}
                </p>
              </div>
              <Button 
                className="bg-gray-500 hover:bg-gray-600"
                onClick={() => setActiveFilter(null)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Table
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading surveys...</p>
              </div>
            ) : filteredSurveys.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey: any) => (
                  <Card key={survey.surveyId || survey.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`}>
                            <CardTitle className="text-lg font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer line-clamp-2">
                              {survey.title}
                            </CardTitle>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{survey.description}</p>
                        </div>
                        {survey.currentParticipants > 0 ? (
                          <div 
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded cursor-not-allowed"
                            title="Cannot edit survey with participants"
                          >
                            <Edit className="h-4 w-4 text-gray-300" />
                          </div>
                        ) : (
                          <Link 
                            href={`/dashboard/teacher/create-survey?edit=${survey.surveyId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 hover:bg-gray-100 rounded"
                            title="Edit survey"
                          >
                            <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {survey.status === "draft" ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : survey.status === "active" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            <Play className="h-3 w-3 mr-1" />
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : survey.status === "expired" ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={`
                            ${survey.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                            ${survey.status === "inactive" ? "bg-red-50 text-red-600 border-red-200" : ""}
                          `}>
                            {survey.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {survey.status === "inactive" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Participants Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Participants</span>
                          <span className="font-medium">{survey.currentParticipants} / {survey.requiredParticipants}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
                            style={{ 
                              width: `${survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>

                      {/* Survey Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Created: {formattedDates[survey.surveyId || survey.id]?.createdAt || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Expires: {formattedDates[survey.surveyId || survey.id]?.expiresAt || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {TARGET_GENDER_SELECT.find(g => g.value.toLowerCase() === String(survey.targetGender).toLowerCase())?.label || survey.targetGender}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {Array.isArray(survey.targetAcademicYears)
                              ? survey.targetAcademicYears.map((year: number) => {
                                  const found = ACADEMIC_YEARS.find(y => y.value === year);
                                  return found ? found.label : year;
                                }).join(", ")
                              : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {Array.isArray(survey.targetDepartmentIds)
                              ? survey.targetDepartmentIds.map((id: number) => {
                                  const found = departments.find(dep => dep.id === id);
                                  return found ? found.name : id;
                                }).join(", ")
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-2">
                        <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/statistics`}>
                          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Statistics
                          </Button>
                        </Link>
                        
                        <div className="flex gap-2">
                          <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2">
                              {survey.currentParticipants > 0 ? (
                                <div className="flex items-center w-full px-2 py-2 text-gray-400 cursor-not-allowed">
                                  <Edit className="h-4 w-4 mr-2" /> Edit (Not available)
                                </div>
                              ) : (
                                <Link 
                                  href={`/dashboard/teacher/create-survey?edit=${survey.surveyId}`}
                                  className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Link>
                              )}
                              <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/statistics`} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded">
                                <BarChart2 className="h-4 w-4 mr-2" /> View Statistics
                              </Link>
                              {survey.status === 'draft' && (
                                <button 
                                  className="flex items-center w-full px-2 py-2 hover:bg-green-100 text-green-600 rounded text-left"
                                  onClick={() => handlePublishSurvey(survey.surveyId)}
                                  disabled={publishingSurveyId === survey.surveyId}
                                >
                                  <Play className="h-4 w-4 mr-2" /> 
                                  {publishingSurveyId === survey.surveyId ? "Publishing..." : "Publish"}
                                </button>
                              )}
                              {survey.status === 'active' && (
                                <button 
                                  className="flex items-center w-full px-2 py-2 hover:bg-orange-100 text-orange-600 rounded text-left"
                                  onClick={() => handleUnpublishSurvey(survey.surveyId)}
                                  disabled={unpublishingSurveyId === survey.surveyId}
                                >
                                  <Pause className="h-4 w-4 mr-2" /> 
                                  {unpublishingSurveyId === survey.surveyId ? "Unpublishing..." : "Unpublish"}
                                </button>
                              )}
                              <button 
                                className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left"
                                onClick={() => handleDuplicateSurvey(survey.surveyId)}
                                disabled={duplicatingSurveyId === survey.surveyId}
                              >
                                <Copy className="h-4 w-4 mr-2" /> 
                                {duplicatingSurveyId === survey.surveyId ? "Duplicating..." : "Duplicate"}
                              </button>
                              <button className="flex items-center w-full px-2 py-2 hover:bg-red-100 text-red-600 rounded text-left">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </button>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {activeFilter === "responses" && "No surveys with responses found"}
                  {activeFilter === "all" && "No surveys found"}
                  {activeFilter === "active" && "No active surveys found"}
                  {activeFilter === "draft" && "No draft surveys found"}
                  {activeFilter === "inactive" && "No inactive surveys found"}
                  {activeFilter === "expired" && "No expired surveys found"}
                  {activeFilter === "completed" && "No completed surveys found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeFilter === "responses" && "Surveys will appear here once they receive responses from participants"}
                  {activeFilter === "all" && "Create your first survey to get started"}
                  {activeFilter === "active" && "No surveys are currently active"}
                  {activeFilter === "draft" && "No surveys are currently in draft status"}
                  {activeFilter === "inactive" && "No surveys are currently inactive"}
                  {activeFilter === "expired" && "No surveys have expired yet"}
                  {activeFilter === "completed" && "No surveys have been completed yet"}
                </p>
                <Link href="/dashboard/teacher/create-survey">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Create New Survey</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          // Original table layout for all surveys
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Surveys</CardTitle>
              <CardDescription>Manage and analyze your created surveys</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || refreshingSurveys ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  {refreshingSurveys ? "Refreshing surveys..." : "Loading surveys..."}
                </div>
              ) : filteredSurveys.length > 0 ? (
                <div className="">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 w-40">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Participants</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Target Gender</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Academic Years</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Departments</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSurveys.map((survey: any, idx: number) => (
                                                <tr key={survey.surveyId} className={`${idx === filteredSurveys.length - 1 ? '' : 'border-b'} hover:bg-gray-50 group`}>
                          <td colSpan={9} className="p-0">
                            {/* Survey Data Row */}
                            <div className="grid grid-cols-9 gap-0">
                              <div className="py-3 px-4 text-left flex items-center">
                                <div>
                                  <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className="hover:bg-gray-50 -m-2 p-2 rounded transition-colors">
                                    <div className="font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer truncate" title={survey.title}>{survey.title}</div>
                                    <div className="text-sm text-gray-500 truncate" title={survey.description}>{survey.description}</div>
                                  </Link>
                                </div>
                              </div>
                              <div className="py-3 px-4 text-left flex items-center justify-center">
                                {survey.status === "draft" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-600 border-orange-200"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                  </Badge>
                                ) : survey.status === "active" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-600 border-green-200"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                  </Badge>
                                ) : survey.status === "expired" ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-50 text-purple-600 border-purple-200"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${survey.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                                      ${survey.status === "inactive" ? "bg-red-50 text-red-600 border-red-200" : ""}
                                    `}
                                  >
                                    {survey.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {survey.status === "inactive" && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              <div className="py-3 px-4 text-left flex items-center">{formattedDates[survey.surveyId]?.createdAt || "-"}</div>
                              <div className="py-3 px-4 text-left flex items-center">{formattedDates[survey.surveyId]?.expiresAt || "-"}</div>
                              <div className="py-3 px-4 text-left flex items-center">
                                <div>
                                  <div className="font-medium">{survey.currentParticipants} / {survey.requiredParticipants}</div>
                                  <div className="mt-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
                                      style={{ 
                                        width: `${survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="py-3 px-4 text-left flex items-center">{
                                TARGET_GENDER_SELECT.find(g => g.value.toLowerCase() === String(survey.targetGender).toLowerCase())?.label || survey.targetGender
                              }</div>
                              <div className="py-3 px-4 text-left flex items-center">{
                                Array.isArray(survey.targetAcademicYears)
                                  ? survey.targetAcademicYears.map((year: number) => {
                                      const found = ACADEMIC_YEARS.find(y => y.value === year);
                                      return found ? found.label : year;
                                    }).join(", ")
                                  : "-"
                              }</div>
                              <div className="py-3 px-4 text-left flex items-center">{
                                Array.isArray(survey.targetDepartmentIds)
                                  ? survey.targetDepartmentIds.map((id: number) => {
                                      const found = departments.find(dep => dep.id === id);
                                      return found ? found.name : id;
                                    }).join(", ")
                                  : "-"
                              }</div>
                              <div className="py-3 px-4 text-left flex items-center justify-center">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent align="end" className="w-48 p-2">
                                    <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded">
                                      <FileText className="h-4 w-4 mr-2" /> View
                                    </Link>
                                    {survey.currentParticipants > 0 ? (
                                      <div className="flex items-center w-full px-2 py-2 text-gray-400 cursor-not-allowed">
                                        <Edit className="h-4 w-4 mr-2" /> Edit (Not available)
                                      </div>
                                    ) : (
                                      <Link 
                                        href={`/dashboard/teacher/create-survey?edit=${survey.surveyId}`}
                                        className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left"
                                      >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                      </Link>
                                    )}
                                    <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/statistics`} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded">
                                  <BarChart2 className="h-4 w-4 mr-2" /> View Statistics
                                </Link>
                                  {survey.status === 'draft' && (
                                    <button 
                                      className="flex items-center w-full px-2 py-2 hover:bg-green-100 text-green-600 rounded text-left"
                                      onClick={() => handlePublishSurvey(survey.surveyId)}
                                      disabled={publishingSurveyId === survey.surveyId}
                                    >
                                      <Play className="h-4 w-4 mr-2" /> 
                                      {publishingSurveyId === survey.surveyId ? "Publishing..." : "Publish"}
                                    </button>
                                  )}
                                  {survey.status === 'active' && (
                                    <button 
                                      className="flex items-center w-full px-2 py-2 hover:bg-orange-100 text-orange-600 rounded text-left"
                                      onClick={() => handleUnpublishSurvey(survey.surveyId)}
                                      disabled={unpublishingSurveyId === survey.surveyId}
                                    >
                                      <Pause className="h-4 w-4 mr-2" /> 
                                      {unpublishingSurveyId === survey.surveyId ? "Unpublishing..." : "Unpublish"}
                                    </button>
                                  )}
                                  <button 
                                    className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded text-left"
                                    onClick={() => handleDuplicateSurvey(survey.surveyId)}
                                    disabled={duplicatingSurveyId === survey.surveyId}
                                  >
                                    <Copy className="h-4 w-4 mr-2" /> 
                                    {duplicatingSurveyId === survey.surveyId ? "Duplicating..." : "Duplicate"}
                                  </button>
                                  <button className="flex items-center w-full px-2 py-2 hover:bg-red-100 text-red-600 rounded text-left">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          
                          {/* Action Buttons Row - Shows on hover */}
                          <div className="opacity-100 transition-opacity duration-200 hover:bg-gray-50 px-4 py-2 -mt-6">
                            <div className="flex gap-2">
                              {survey.currentParticipants === 0 || survey.status === 'active' || survey.status === 'expired' || survey.status === 'inactive' || survey.status === 'completed' ? (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(survey)}
                                    className="h-7 px-3 text-xs text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                  >
                                    <Edit className="h-3 w-3 mr-1 inline" />
                                    Quick Edit
                                  </button>
                                  <Link href={`/dashboard/teacher/create-survey?edit=${survey.surveyId}`}>
                                    <button className="h-7 px-3 text-xs text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                                      <Settings className="h-3 w-3 mr-1 inline" />
                                      Edit
                                    </button>
                                  </Link>
                                  {survey.status === 'draft' && (
                                    <button
                                      onClick={() => handlePublishSurvey(survey.surveyId)}
                                      disabled={publishingSurveyId === survey.surveyId}
                                      className="h-7 px-3 text-xs text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors disabled:opacity-50"
                                    >
                                      <Play className="h-3 w-3 mr-1 inline" />
                                      {publishingSurveyId === survey.surveyId ? "Publishing..." : "Publish"}
                                    </button>
                                  )}
                                  {survey.status === 'active' && (
                                    <button
                                      onClick={() => handleUnpublishSurvey(survey.surveyId)}
                                      disabled={unpublishingSurveyId === survey.surveyId}
                                      className="h-7 px-3 text-xs text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors disabled:opacity-50"
                                    >
                                      <Pause className="h-3 w-3 mr-1 inline" />
                                      {unpublishingSurveyId === survey.surveyId ? "Unpublishing..." : "Unpublish"}
                                    </button>
                                  )}
                                </>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        Cannot edit - has participants
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Cannot edit survey with existing participants</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
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
        )}
      </main>

      {/* Quick Edit Dialog */}
      <Dialog open={quickEditDialogOpen} onOpenChange={setQuickEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Quick Edit Survey
              {editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId) && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {surveys.find(s => s.surveyId === editingSurveyId)?.title}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId)?.status === 'active' && surveys.find(s => s.surveyId === editingSurveyId)?.currentParticipants > 0
                ? "Update the end date and participant requirements for this active survey. Start date cannot be changed once survey has participants."
                : editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired' && surveys.find(s => s.surveyId === editingSurveyId)?.currentParticipants > 0
                ? "Update the end date and participant requirements for this expired survey. Start date cannot be changed once survey has participants."
                : editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId)?.status === 'completed' && surveys.find(s => s.surveyId === editingSurveyId)?.currentParticipants > 0
                ? "Update the end date and participant requirements for this completed survey. Start date cannot be changed once survey has participants."
                : editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId)?.status === 'inactive'
                ? "Update the survey dates and participant requirements for this scheduled survey. All fields can be modified."
                : "Update the survey dates and participant requirements. Changes will be applied immediately."
              }
            </DialogDescription>
          </DialogHeader>
          
          {editingSurveyId && (
            <div className="space-y-6">
              {editingSurveyId && (surveys.find(s => s.surveyId === editingSurveyId)?.status === 'active' || surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired' || surveys.find(s => s.surveyId === editingSurveyId)?.status === 'completed') && surveys.find(s => s.surveyId === editingSurveyId)?.currentParticipants > 0 ? (
                // For active surveys with participants - only show end date
                <div className="space-y-4">
                  <div className={`p-3 border rounded-lg ${
                    surveys.find(s => s.surveyId === editingSurveyId)?.status === 'active'
                      ? 'bg-orange-50 border-orange-200'
                      : surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-indigo-50 border-indigo-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${
                        surveys.find(s => s.surveyId === editingSurveyId)?.status === 'active'
                          ? 'text-orange-600'
                          : surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired'
                          ? 'text-purple-600'
                          : 'text-indigo-600'
                      }`} />
                      <p className={`text-sm ${
                        surveys.find(s => s.surveyId === editingSurveyId)?.status === 'active'
                          ? 'text-orange-800'
                          : surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired'
                          ? 'text-purple-800'
                          : 'text-indigo-800'
                      }`}>
                        Start date is locked because this {surveys.find(s => s.surveyId === editingSurveyId)?.status} survey has participants. Only end date and participant count can be modified.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Input
                      type="date"
                      value={editingData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="h-10"
                      placeholder="YYYY-MM-DD"
                    />
                    {surveys.find(s => s.surveyId === editingSurveyId)?.endDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {new Date(surveys.find(s => s.surveyId === editingSurveyId)?.endDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(',', ' -')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // For surveys without participants - show both start and end date
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={editingData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="h-10"
                      placeholder="YYYY-MM-DD"
                    />
                    {surveys.find(s => s.surveyId === editingSurveyId)?.startDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {new Date(surveys.find(s => s.surveyId === editingSurveyId)?.startDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(',', ' -')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Input
                      type="date"
                      value={editingData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="h-10"
                      placeholder="YYYY-MM-DD"
                    />
                    {surveys.find(s => s.surveyId === editingSurveyId)?.endDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {new Date(surveys.find(s => s.surveyId === editingSurveyId)?.endDate).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }).replace(',', ' -')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Participants</label>
                <Input
                  type="number"
                  min="1"
                  value={editingData.requiredParticipants}
                  onChange={(e) => handleInputChange('requiredParticipants', parseInt(e.target.value) || 0)}
                  className="h-10"
                  placeholder="Minimum: 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {surveys.find(s => s.surveyId === editingSurveyId)?.requiredParticipants || 0}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updatingSurveyId !== null}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveEdit(editingSurveyId)}
                  disabled={updatingSurveyId !== null}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {updatingSurveyId !== null ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
