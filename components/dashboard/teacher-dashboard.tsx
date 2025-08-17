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
  Award,
  Grid3X3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select"
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
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [duplicatingSurveyId, setDuplicatingSurveyId] = useState<number | null>(null);
  const [publishingSurveyId, setPublishingSurveyId] = useState<number | null>(null);
  const [unpublishingSurveyId, setUnpublishingSurveyId] = useState<number | null>(null);
  const [showSurveysWithResponses, setShowSurveysWithResponses] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>("all");
  
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  useEffect(() => {
    // On mount, check if mobile and set to cards if needed
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('cards');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    SurveyService.getTeacherSurveys()
      .then((data) => {
        console.log("Loaded surveys:", data);
        console.log("Sample survey academic years:", data[0]?.targetAcademicYears);
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
        statusFilter === "all" || statusFilter === "responses" || survey.status === statusFilter;
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

    // Apply gender filter
    if (genderFilter && genderFilter !== "all") {
      filtered = filtered.filter((survey: any) => String(survey.targetGender).toLowerCase() === String(genderFilter).toLowerCase());
    }

    // Apply academic years filter (any intersection)
    if (yearFilter && yearFilter !== "all") {
      const selectedYears = yearFilter.split(",").filter(Boolean);
      if (!selectedYears.includes("all") && selectedYears.length > 0) {
        const selectedYearsNums = selectedYears
          .map((y) => Number(y))
          .filter((n) => Number.isFinite(n));
        console.log("Selected years:", selectedYearsNums);
        filtered = filtered.filter((survey: any) => {
          const surveyYears = Array.isArray(survey.targetAcademicYears)
            ? survey.targetAcademicYears
                .map((y: any) => Number(y))
                .filter((n: any) => Number.isFinite(n))
            : [];
          console.log("Survey years for", survey.title, ":", surveyYears);
          const hasMatch = surveyYears.some((y: number) => selectedYearsNums.includes(y));
          console.log("Has match:", hasMatch);
          return surveyYears.some((y: number) => selectedYearsNums.includes(y));
        });
      }
    }

    // Apply departments filter (any intersection)
    if (departmentFilter && departmentFilter !== "all") {
      const selectedDeps = departmentFilter.split(",").filter(Boolean);
      if (!selectedDeps.includes("all") && selectedDeps.length > 0) {
        const selectedDepIds = selectedDeps
          .map((d) => Number(d))
          .filter((n) => Number.isFinite(n));
        filtered = filtered.filter((survey: any) => {
          const surveyDepIds = Array.isArray(survey.targetDepartmentIds)
            ? survey.targetDepartmentIds
                .map((id: any) => Number(id))
                .filter((n: any) => Number.isFinite(n))
            : [];
          return surveyDepIds.some((id: number) => selectedDepIds.includes(id));
        });
      }
    }

    return filtered;
  }, [surveys, searchQuery, statusFilter, activeFilter, genderFilter, yearFilter, departmentFilter]);

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
          {/* First Row - Total Surveys and Total Responses */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className={`${activeFilter === "all" ? "bg-blue-50 border-blue-200" : ""} hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer`}
              onClick={() => {
                if (activeFilter !== "all") {
                  const newFilter = activeFilter === "all" ? null : "all";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }
              }}
            >
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
                  className={`w-full flex items-center justify-center gap-2 ${
                    activeFilter === "all" 
                      ? "bg-blue-100 border-blue-300 text-blue-800 cursor-not-allowed" 
                      : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeFilter !== "all") {
                      const newFilter = activeFilter === "all" ? null : "all";
                      setActiveFilter(newFilter);
                      setStatusFilter(newFilter || "all");
                    }
                  }}
                  disabled={activeFilter === "all"}
                >
                  <FileText className="h-4 w-4" />
                  {activeFilter === "all" ? "Viewing All Surveys" : "View All Surveys"}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className={`${activeFilter === "responses" ? "bg-emerald-50 border-emerald-200" : ""} hover:bg-emerald-50/50 transition-colors duration-200 cursor-pointer`}
              onClick={() => {
                const newFilter = activeFilter === "responses" ? null : "responses";
                setActiveFilter(newFilter);
                setStatusFilter(newFilter || "all");
              }}
            >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFilter = activeFilter === "responses" ? null : "responses";
                    setActiveFilter(newFilter);
                    setStatusFilter(newFilter || "all");
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  {activeFilter === "responses" ? "Show All" : "View Responses"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Status Cards */}
          <div className="grid gap-4 md:grid-cols-5">

          <Card 
            className={`${activeFilter === "active" ? "bg-green-50 border-green-200" : ""} hover:bg-green-50/50 transition-colors duration-200 cursor-pointer`}
            onClick={() => {
              const newFilter = activeFilter === "active" ? null : "active";
              setActiveFilter(newFilter);
              setStatusFilter(newFilter || "all");
            }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilter = activeFilter === "active" ? null : "active";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }}
              >
                <Play className="h-4 w-4" />
                {activeFilter === "active" ? "Show All Surveys" : "View Active Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`${activeFilter === "draft" ? "bg-orange-50 border-orange-200" : ""} hover:bg-orange-50/50 transition-colors duration-200 cursor-pointer`}
            onClick={() => {
              const newFilter = activeFilter === "draft" ? null : "draft";
              setActiveFilter(newFilter);
              setStatusFilter(newFilter || "all");
            }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilter = activeFilter === "draft" ? null : "draft";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }}
              >
                <Clock className="h-4 w-4" />
                {activeFilter === "draft" ? "Show All Surveys" : "View Draft Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`${activeFilter === "inactive" ? "bg-red-50 border-red-200" : ""} hover:bg-red-50/50 transition-colors duration-200 cursor-pointer`}
            onClick={() => {
              const newFilter = activeFilter === "inactive" ? null : "inactive";
              setActiveFilter(newFilter);
              setStatusFilter(newFilter || "all");
            }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilter = activeFilter === "inactive" ? null : "inactive";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }}
              >
                <AlertCircle className="h-4 w-4" />
                {activeFilter === "inactive" ? "Show All Surveys" : "View Inactive Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`${activeFilter === "expired" ? "bg-purple-50 border-purple-200" : ""} hover:bg-purple-50/50 transition-colors duration-200 cursor-pointer`}
            onClick={() => {
              const newFilter = activeFilter === "expired" ? null : "expired";
              setActiveFilter(newFilter);
              setStatusFilter(newFilter || "all");
            }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilter = activeFilter === "expired" ? null : "expired";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }}
              >
                <Clock className="h-4 w-4" />
                {activeFilter === "expired" ? "Show All Surveys" : "View Expired Surveys"}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`${activeFilter === "completed" ? "bg-indigo-50 border-indigo-200" : ""} hover:bg-indigo-50/50 transition-colors duration-200 cursor-pointer`}
            onClick={() => {
              const newFilter = activeFilter === "completed" ? null : "completed";
              setActiveFilter(newFilter);
              setStatusFilter(newFilter || "all");
            }}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  const newFilter = activeFilter === "completed" ? null : "completed";
                  setActiveFilter(newFilter);
                  setStatusFilter(newFilter || "all");
                }}
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
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search surveys..."
              className="pl-10"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between">
            <div className="w-full md:w-56">
              <CustomSelect
                value={activeFilter || statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  if (value === 'all') {
                    setActiveFilter("all");
                  } else {
                    setActiveFilter(value);
                  }
                }}
                placeholder="Filter by status"
              >
                <CustomSelectOption value="all">All Surveys</CustomSelectOption>
                <CustomSelectOption value="responses">Surveys with Responses</CustomSelectOption>
                <CustomSelectOption value="draft">Draft</CustomSelectOption>
                <CustomSelectOption value="inactive">Inactive</CustomSelectOption>
                <CustomSelectOption value="active">Active</CustomSelectOption>
                <CustomSelectOption value="completed">Completed</CustomSelectOption>
                <CustomSelectOption value="expired">Expired</CustomSelectOption>
              </CustomSelect>
            </div>
            <div className="w-full md:w-64">
              <CustomSelect
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="Filter by departments"
                multiple
              >
                <CustomSelectOption value="all" multiple>
                  All Departments
                </CustomSelectOption>
                {departments.map((dep) => (
                  <CustomSelectOption key={dep.id} value={String(dep.id)} multiple>
                    {dep.name}
                  </CustomSelectOption>
                ))}
              </CustomSelect>
            </div>
            <div className="w-full md:w-64">
              <CustomSelect
                value={yearFilter}
                onChange={setYearFilter}
                placeholder="Filter by academic years"
                multiple
              >
                <CustomSelectOption value="all" multiple>
                  All Academic Years
                </CustomSelectOption>
                {ACADEMIC_YEARS.map((y) => (
                  <CustomSelectOption key={y.value} value={String(y.value)} multiple>
                    {y.label}
                  </CustomSelectOption>
                ))}
              </CustomSelect>
            </div>
            <div className="w-full md:w-56">
              <CustomSelect
                value={genderFilter}
                onChange={setGenderFilter}
                placeholder="Filter by gender"
              >
                <CustomSelectOption value="all">All</CustomSelectOption>
                {TARGET_GENDER_SELECT.filter(g => g.value !== 'all').map((g) => (
                  <CustomSelectOption key={g.value} value={String(g.value)}>
                    {g.label}
                  </CustomSelectOption>
                ))}
              </CustomSelect>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 ${
                  viewMode === 'cards'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        {viewMode === 'cards' ? (
          <div className="space-y-6">
                          <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeFilter === "responses" && "Surveys with Responses"}
                  {activeFilter === "all" && "All Surveys"}
                  {activeFilter === "active" && "Active Surveys"}
                  {activeFilter === "draft" && "Draft Surveys"}
                  {activeFilter === "inactive" && "Inactive Surveys"}
                  {activeFilter === "expired" && "Expired Surveys"}
                  {activeFilter === "completed" && "Completed Surveys"}
                  {!activeFilter && viewMode === 'cards' && "All Surveys"}
                </h2>
                <p className="text-gray-600">
                  {activeFilter === "responses" && "Surveys that have received responses from participants"}
                  {activeFilter === "all" && "All surveys created by you"}
                  {activeFilter === "active" && "Surveys that are currently active and accepting responses"}
                  {activeFilter === "draft" && "Surveys that are in draft status and not yet published"}
                  {activeFilter === "inactive" && "Surveys that are inactive and not accepting responses"}
                  {activeFilter === "expired" && "Surveys that have passed their end date and are no longer accepting responses"}
                  {activeFilter === "completed" && "Surveys that have been completed and are no longer accepting responses"}
                  {!activeFilter && viewMode === 'cards' && "All surveys created by you"}
                </p>
              </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading surveys...</p>
              </div>
            ) : filteredSurveys.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSurveys.map((survey: any) => (
                  <Card key={survey.surveyId || survey.id} className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50/30 to-white">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      survey.status === "draft" ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                      survey.status === "active" ? "bg-gradient-to-r from-green-400 to-green-600" :
                      survey.status === "expired" ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                      survey.status === "completed" ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                      "bg-gradient-to-r from-red-400 to-red-600"
                    }`} />
                    
                    <CardHeader className="pb-4 pt-6">
                      {/* Header with Status Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`}>
                            <CardTitle className="text-lg font-bold text-gray-900 hover:text-emerald-600 cursor-pointer line-clamp-2 transition-colors duration-200">
                              {survey.title}
                            </CardTitle>
                          </Link>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{survey.description}</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        {survey.status === "draft" ? (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 transition-colors">
                            <Clock className="h-3 w-3 mr-1.5" />
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : survey.status === "active" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors">
                            <Play className="h-3 w-3 mr-1.5" />
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : survey.status === "expired" ? (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 transition-colors">
                            <Clock className="h-3 w-3 mr-1.5" />
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        ) : (
                          <Badge className={`
                            ${survey.status === "completed" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : ""}
                            ${survey.status === "inactive" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" : ""}
                            transition-colors
                          `}>
                            {survey.status === "completed" && <CheckCircle className="h-3 w-3 mr-1.5" />}
                            {survey.status === "inactive" && <AlertCircle className="h-3 w-3 mr-1.5" />}
                            {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        )}
                        
                        {/* Points Reward */}
                        <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                          <Award className="h-4 w-4" />
                          <span>{survey.pointsReward || 0}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-5">
                      {/* Participants Progress */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Participants</span>
                          <span className="text-sm font-bold text-gray-900">{survey.currentParticipants} / {survey.requiredParticipants}</span>
                        </div>
                        <div className="relative">
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-500 ease-out shadow-sm"
                              style={{ 
                                width: `${survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0}%` 
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {survey.requiredParticipants ? Math.round((survey.currentParticipants / survey.requiredParticipants) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Survey Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Created</p>
                            <p className="text-gray-700 truncate">{formattedDates[survey.surveyId || survey.id]?.createdAt || "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Expires</p>
                            <p className="text-gray-700 truncate">{formattedDates[survey.surveyId || survey.id]?.expiresAt || "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Target className="h-4 w-4 text-blue-500" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Gender</p>
                            <p className="text-gray-700 truncate">
                              {TARGET_GENDER_SELECT.find(g => g.value.toLowerCase() === String(survey.targetGender).toLowerCase())?.label || survey.targetGender}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Years</p>
                            {(() => {
                              const academicYearsText = Array.isArray(survey.targetAcademicYears) && survey.targetAcademicYears.length > 0
                                ? survey.targetAcademicYears.length === ACADEMIC_YEARS.length
                                  ? "All"
                                  : survey.targetAcademicYears.map((year: number) => {
                                      const found = ACADEMIC_YEARS.find(y => y.value === year);
                                      return found ? found.label : year;
                                    }).join(", ")
                                : "-";
                              const fullText = Array.isArray(survey.targetAcademicYears) && survey.targetAcademicYears.length > 0
                                ? survey.targetAcademicYears.map((year: number) => {
                                    const found = ACADEMIC_YEARS.find(y => y.value === year);
                                    return found ? found.label : year;
                                  }).join(", ")
                                : "-";
                              
                                                             return academicYearsText !== fullText ? (
                                 <TooltipProvider>
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <p className="text-gray-700 truncate cursor-help hover:bg-gray-100 hover:text-gray-900 px-1 py-0.5 rounded transition-colors duration-200">
                                         {academicYearsText}
                                       </p>
                                     </TooltipTrigger>
                                     <TooltipContent>
                                       <p>{fullText}</p>
                                     </TooltipContent>
                                   </Tooltip>
                                 </TooltipProvider>
                               ) : (
                                 <p className="text-gray-700 truncate">
                                   {academicYearsText}
                                 </p>
                               );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Departments */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Building className="h-4 w-4 text-indigo-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-medium">Departments</p>
                          {(() => {
                            const departmentsText = Array.isArray(survey.targetDepartmentIds) && survey.targetDepartmentIds.length > 0
                              ? survey.targetDepartmentIds.length === departments.length
                                ? "All"
                                : survey.targetDepartmentIds.map((id: number) => {
                                    const found = departments.find(dep => dep.id === id);
                                    return found ? found.name : id;
                                  }).join(", ")
                              : "-";
                            const fullText = Array.isArray(survey.targetDepartmentIds) && survey.targetDepartmentIds.length > 0
                              ? survey.targetDepartmentIds.map((id: number) => {
                                  const found = departments.find(dep => dep.id === id);
                                  return found ? found.name : id;
                                }).join(", ")
                              : "-";
                            
                            return departmentsText !== fullText ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-gray-700 truncate cursor-help hover:bg-gray-100 hover:text-gray-900 px-1 py-0.5 rounded transition-colors duration-200">
                                      {departmentsText}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{fullText}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <p className="text-gray-700 truncate">
                                {departmentsText}
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-2">
                        <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/statistics`}>
                          <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-sm transition-all duration-200">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Statistics
                          </Button>
                        </Link>
                        
                        <div className="flex gap-2">
                          <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          {(survey.currentParticipants > 0 || survey.status === 'expired') ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled
                              className="flex-1 border-gray-200 text-gray-400 cursor-not-allowed"
                              title={survey.currentParticipants > 0 ? "Edit not available when survey has responses" : "Edit not available for expired surveys"}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <Link href={`/dashboard/teacher/create-survey?edit=${survey.surveyId}`} className="flex-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStartEdit(survey)}
                            className="flex-1 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Quick Edit
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-2">
                              <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className="flex items-center w-full px-2 py-2 hover:bg-gray-100 rounded">
                                <FileText className="h-4 w-4 mr-2" /> View
                              </Link>
                              {(survey.currentParticipants > 0 || survey.status === 'expired') ? (
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
                                  className={`flex items-center w-full px-2 py-2 rounded text-left ${
                                    survey.currentParticipants > 0 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : 'hover:bg-orange-100 text-orange-600'
                                  }`}
                                  onClick={() => handleUnpublishSurvey(survey.surveyId)}
                                  disabled={unpublishingSurveyId === survey.surveyId || survey.currentParticipants > 0}
                                >
                                  <Pause className="h-4 w-4 mr-2" /> 
                                  {unpublishingSurveyId === survey.surveyId ? "Unpublishing..." : 
                                   survey.currentParticipants > 0 ? "Unpublish (Not available)" : "Unpublish"}
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

                            </PopoverContent>
                          </Popover>
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
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Survey
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : viewMode === 'table' ? (
          // Table layout for all surveys
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {activeFilter === "responses" && "Surveys with Responses"}
                {activeFilter === "all" && "All Surveys"}
                {activeFilter === "active" && "Active Surveys"}
                {activeFilter === "draft" && "Draft Surveys"}
                {activeFilter === "inactive" && "Inactive Surveys"}
                {activeFilter === "expired" && "Expired Surveys"}
                {activeFilter === "completed" && "Completed Surveys"}
                {!activeFilter && "Your Surveys"}
              </CardTitle>
              <CardDescription>Manage and analyze your created surveys</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || refreshingSurveys ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                  {refreshingSurveys ? "Refreshing surveys..." : "Loading surveys..."}
                </div>
              ) : filteredSurveys.length > 0 ? (
                <div className="overflow-x-auto md:overflow-x-hidden">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 w-40 max-w-xs">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Expires</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Participants</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Target Gender</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Academic Years</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSurveys.map((survey: any, idx: number) => (
                        <tr key={survey.surveyId} className={`${idx === filteredSurveys.length - 1 ? '' : 'border-b'} hover:bg-gray-50 group`}>
                          {/* Title Column */}
                          <td className="py-3 px-4 text-left">
                            <div>
                              <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`} className=" -m-2 p-2 rounded transition-colors">
                                <div className="font-bold text-lg text-emerald-600 hover:text-emerald-700 cursor-pointer break-words max-w-xs" title={survey.title}>
                                  {survey.title}
                                  </div>
                                <div className="text-base text-gray-500 truncate max-w-xs" title={survey.description}>
                                  {survey.description && survey.description.length > 30 
                                    ? `${survey.description.substring(0, 30)}...` 
                                    : survey.description}
                                </div>
                              </Link>
                            </div>
                          </td>
                          
                          {/* Status Column */}
                          <td className="py-3 px-4 text-left">
                            {survey.status === "draft" ? (
                              <Badge
                                variant="outline"
                                className="bg-orange-50 text-orange-600 border-orange-200 text-xs"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                              </Badge>
                            ) : survey.status === "active" ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-600 border-green-200 text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                              </Badge>
                            ) : survey.status === "expired" ? (
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-600 border-purple-200 text-xs"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className={`
                                  ${survey.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200 text-xs" : ""}
                                  ${survey.status === "inactive" ? "bg-red-50 text-red-600 border-red-200 text-xs" : ""}
                                `}
                              >
                                {survey.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {survey.status === "inactive" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {SURVEY_STATUS_LABELS[survey.status as keyof typeof SURVEY_STATUS_LABELS] || survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                              </Badge>
                            )}
                          </td>
                          
                          {/* Created Date Column */}
                          <td className="py-3 px-4 text-left text-base">{formattedDates[survey.surveyId]?.createdAt || "-"}</td>
                          
                          {/* Expires Date Column */}
                          <td className="py-3 px-4 text-left text-base">{formattedDates[survey.surveyId]?.expiresAt || "-"}</td>
                          
                          {/* Participants Column */}
                          <td className="py-3 px-4 text-left">
                            <div>
                              <div className="font-medium text-base flex items-center gap-2">
                                {survey.currentParticipants} / {survey.requiredParticipants}
                                {survey.currentParticipants >= survey.requiredParticipants && (
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div className="mt-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
                                  style={{ 
                                    width: `${survey.requiredParticipants ? (survey.currentParticipants / survey.requiredParticipants) * 100 : 0}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          
                          {/* Target Gender Column */}
                          <td className="py-3 px-4 text-left text-base">
                            {TARGET_GENDER_SELECT.find(g => g.value.toLowerCase() === String(survey.targetGender).toLowerCase())?.label || survey.targetGender}
                          </td>
                          
                          {/* Academic Years Column */}
                          <td className="py-3 px-4 text-left text-base">
                            {(() => {
                              const academicYearsText = Array.isArray(survey.targetAcademicYears) && survey.targetAcademicYears.length > 0
                                ? survey.targetAcademicYears.length === ACADEMIC_YEARS.length
                                  ? "All"
                                  : survey.targetAcademicYears.map((year: number) => {
                                      const found = ACADEMIC_YEARS.find(y => y.value === year);
                                      return found ? found.label : year;
                                    }).join(", ")
                                : "-";
                              const fullText = Array.isArray(survey.targetAcademicYears) && survey.targetAcademicYears.length > 0
                                ? survey.targetAcademicYears.map((year: number) => {
                                    const found = ACADEMIC_YEARS.find(y => y.value === year);
                                    return found ? found.label : year;
                                  }).join(", ")
                                : "-";
                              
                              return academicYearsText !== fullText ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help hover:bg-gray-100 hover:text-gray-900 px-1 py-0.5 rounded transition-colors duration-200">
                                        {academicYearsText}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{fullText}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span>{academicYearsText}</span>
                              );
                            })()}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/view`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  title="View Survey"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/dashboard/teacher/surveys/${survey.surveyId}/statistics`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  title="View Statistics"
                                >
                                  <BarChart2 className="h-3 w-3 mr-1" />
                                  Statistics
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStartEdit(survey)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Quick Edit"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Quick Edit
                              </Button>
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
                                  {(survey.currentParticipants > 0 || survey.status === 'expired') ? (
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
                                      className={`flex items-center w-full px-2 py-2 rounded text-left ${
                                        survey.currentParticipants > 0 
                                          ? 'text-gray-400 cursor-not-allowed' 
                                          : 'hover:bg-orange-100 text-orange-600'
                                      }`}
                                      onClick={() => handleUnpublishSurvey(survey.surveyId)}
                                      disabled={unpublishingSurveyId === survey.surveyId || survey.currentParticipants > 0}
                                    >
                                      <Pause className="h-4 w-4 mr-2" /> 
                                      {unpublishingSurveyId === survey.surveyId ? "Unpublishing..." : 
                                       survey.currentParticipants > 0 ? "Unpublish (Not available)" : "Unpublish"}
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

                                </PopoverContent>
                              </Popover>
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
                  <Link href="/dashboard/teacher/create-survey">
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Survey
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
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
              ) : editingSurveyId && surveys.find(s => s.surveyId === editingSurveyId)?.status === 'expired' ? (
                // For expired surveys - only show end date and participants
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-purple-800">
                        This survey has expired. Only end date and participant count can be modified.
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
