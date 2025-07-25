"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle2, ChevronDown, Filter, MessageSquare, Search, User, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock data for comments
const commentsData = [
  {
    id: 1,
    surveyTitle: "Course Evaluation: Advanced Programming",
    studentName: "Alex Johnson",
    studentId: "S12345",
    department: "Computer Science",
    comment:
      "The course was well-structured and the programming assignments were challenging but fair. I particularly enjoyed the group project.",
    rating: 5,
    date: "2025-05-15T14:30:00",
    status: "pending",
    flags: 0,
  },
  {
    id: 2,
    surveyTitle: "Teaching Methods Feedback",
    studentName: "Jamie Smith",
    studentId: "S23456",
    department: "Engineering",
    comment:
      "I would have liked more practical examples and less theory. The lectures were sometimes hard to follow without concrete applications.",
    rating: 3,
    date: "2025-05-14T10:15:00",
    status: "approved",
    flags: 0,
  },
  {
    id: 3,
    surveyTitle: "Laboratory Equipment Assessment",
    studentName: "Taylor Wilson",
    studentId: "S34567",
    department: "Engineering",
    comment:
      "The lab equipment is outdated and often malfunctions. This has significantly impacted my ability to complete assignments on time.",
    rating: 2,
    date: "2025-05-13T16:45:00",
    status: "pending",
    flags: 1,
  },
  {
    id: 4,
    surveyTitle: "Course Evaluation: Advanced Programming",
    studentName: "Morgan Lee",
    studentId: "S45678",
    department: "Computer Science",
    comment:
      "This course is a complete waste of time. The instructor clearly doesn't care about teaching and the material is useless.",
    rating: 1,
    date: "2025-05-12T09:20:00",
    status: "rejected",
    flags: 3,
  },
  {
    id: 5,
    surveyTitle: "Research Project Interest Survey",
    studentName: "Casey Brown",
    studentId: "S56789",
    department: "Mathematics",
    comment:
      "I'm excited about the research opportunities presented in this survey. I would be particularly interested in joining the AI ethics project.",
    rating: 5,
    date: "2025-05-11T13:10:00",
    status: "approved",
    flags: 0,
  },
  {
    id: 6,
    surveyTitle: "Teaching Methods Feedback",
    studentName: "Jordan Miller",
    studentId: "S67890",
    department: "Business",
    comment:
      "The interactive teaching methods used in this course have greatly enhanced my learning experience. I appreciate the effort put into making complex concepts accessible.",
    rating: 5,
    date: "2025-05-10T11:30:00",
    status: "pending",
    flags: 0,
  },
]

export default function CommentModeration() {
  const router = useRouter();
  const { toast } = useToast()
  const [comments, setComments] = useState(commentsData)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSurvey, setSelectedSurvey] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [commentToReject, setCommentToReject] = useState<number | null>(null)
  const [selectedComments, setSelectedComments] = useState<number[]>([])
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesTab = activeTab === "all" || comment.status === activeTab
      const matchesSearch =
        comment.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSurvey = selectedSurvey === "all" || comment.surveyTitle === selectedSurvey
      const matchesDepartment = selectedDepartment === "all" || comment.department === selectedDepartment

      return matchesTab && matchesSearch && matchesSurvey && matchesDepartment
    });
  }, [comments, activeTab, searchQuery, selectedSurvey, selectedDepartment]);

  const [formattedCommentDates, setFormattedCommentDates] = useState<{[id: string]: string}>({});

  useEffect(() => {
    const newFormatted: {[id: string]: string} = {};
    filteredComments.forEach(comment => {
      newFormatted[comment.id] = comment.date ? new Date(comment.date).toLocaleDateString() + " " + new Date(comment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
    });
    setFormattedCommentDates(newFormatted);
  }, [filteredComments]);

  // Get unique survey titles and departments for filters
  const surveyTitles = Array.from(new Set(comments.map((comment) => comment.surveyTitle)))
  const departments = Array.from(new Set(comments.map((comment) => comment.department)))

  // Handle comment approval
  const handleApproveComment = (id: number) => {
    setComments(comments.map((comment) => (comment.id === id ? { ...comment, status: "approved" } : comment)))
    toast({
      title: "Comment Approved",
      description: "The comment has been approved and is now visible to students.",
    })
  }

  // Handle comment rejection
  const handleRejectComment = (id: number) => {
    setCommentToReject(id)
    setShowRejectionDialog(true)
  }

  const confirmRejectComment = () => {
    if (commentToReject) {
      setComments(
        comments.map((comment) => (comment.id === commentToReject ? { ...comment, status: "rejected" } : comment)),
      )
      toast({
        title: "Comment Rejected",
        description: "The comment has been rejected and will not be visible to students.",
      })
      setShowRejectionDialog(false)
      setRejectionReason("")
      setCommentToReject(null)
    }
  }

  // Handle bulk actions
  const handleBulkApprove = () => {
    if (selectedComments.length === 0) {
      toast({
        title: "No Comments Selected",
        description: "Please select at least one comment to approve.",
        variant: "destructive",
      })
      return
    }

    setComments(
      comments.map((comment) => (selectedComments.includes(comment.id) ? { ...comment, status: "approved" } : comment)),
    )
    toast({
      title: "Comments Approved",
      description: `${selectedComments.length} comments have been approved.`,
    })
    setSelectedComments([])
  }

  const handleBulkReject = () => {
    if (selectedComments.length === 0) {
      toast({
        title: "No Comments Selected",
        description: "Please select at least one comment to reject.",
        variant: "destructive",
      })
      return
    }

    setComments(
      comments.map((comment) => (selectedComments.includes(comment.id) ? { ...comment, status: "rejected" } : comment)),
    )
    toast({
      title: "Comments Rejected",
      description: `${selectedComments.length} comments have been rejected.`,
    })
    setSelectedComments([])
  }

  // Handle comment selection
  const handleSelectComment = (id: number) => {
    setSelectedComments(
      selectedComments.includes(id)
        ? selectedComments.filter((commentId) => commentId !== id)
        : [...selectedComments, id],
    )
  }

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([])
    } else {
      setSelectedComments(filteredComments.map((comment) => comment.id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search comments or students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Survey</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surveys</SelectItem>
                  {surveyTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Department</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Student Comments</CardTitle>
                <CardDescription>Review and moderate comments from students</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      Bulk Actions <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBulkApprove}>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkReject}>
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Reject Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSelectAll}>
                      <Checkbox
                        checked={filteredComments.length > 0 && selectedComments.length === filteredComments.length}
                        className="mr-2"
                      />
                      {selectedComments.length === filteredComments.length ? "Deselect All" : "Select All"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending{" "}
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {comments.filter((c) => c.status === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved{" "}
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {comments.filter((c) => c.status === "approved").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected{" "}
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {comments.filter((c) => c.status === "rejected").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="all">All Comments</TabsTrigger>
            </TabsList>
          </Tabs>

          <CardContent className="pt-6">
            {filteredComments.length > 0 ? (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`border rounded-lg p-4 ${
                      selectedComments.includes(comment.id) ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedComments.includes(comment.id)}
                        onCheckedChange={() => handleSelectComment(comment.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{comment.studentName}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                              <span>{comment.studentId}</span>
                              <span>•</span>
                              <span>{comment.department}</span>
                              <span>•</span>
                              <span>{formattedCommentDates[comment.id] || "-"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`
                                ${comment.status === "pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : ""}
                                ${comment.status === "approved" ? "bg-green-50 text-green-600 border-green-200" : ""}
                                ${comment.status === "rejected" ? "bg-red-50 text-red-600 border-red-200" : ""}
                              `}
                            >
                              {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                            </Badge>
                            {comment.flags > 0 && (
                              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {comment.flags} {comment.flags === 1 ? "Flag" : "Flags"}
                              </Badge>
                            )}
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${i < comment.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm text-gray-500 mb-1">Survey: {comment.surveyTitle}</div>
                          <p className="text-gray-700">{comment.comment}</p>
                        </div>

                        {comment.status === "pending" && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleRejectComment(comment.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApproveComment(comment.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No comments found</h3>
                <p className="text-gray-500">
                  {activeTab === "pending"
                    ? "There are no pending comments to moderate."
                    : "No comments match your current filters."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Comment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this comment. This information will be visible to the student.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Violates community guidelines, contains inappropriate language, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmRejectComment}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={!rejectionReason.trim()}
              >
                Reject Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
