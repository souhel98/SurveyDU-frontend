"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { GENDERS, ACADEMIC_YEARS } from "@/lib/constants"
import { useEffect } from "react";
import api from "@/lib/api/axios";
import { DepartmentService } from "@/lib/services/department-service";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";

// Personal Information Form Schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  departmentName: z.string({ required_error: "Please select a department." }).min(2, { message: "Department must be at least 2 characters." }),
  academicYear: z.string({ required_error: "Please select an academic year." }),
  gender: z.string({ required_error: "Please select a gender." }),
  dateOfBirth: z.date({ required_error: "Please select a date of birth." }),
  universityIdNumber: z.string().min(5, { message: "University ID must be at least 5 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
})

// Password Change Form Schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Helper functions to map API value to label
function getAcademicYearLabel(apiValue: string) {
  const found = ACADEMIC_YEARS.find(y => y.label.toLowerCase() === apiValue.toLowerCase());
  return found ? found.label : "";
}
function getGenderLabel(apiValue: string) {
  const found = GENDERS.find(g => g.label.toLowerCase() === apiValue.toLowerCase());
  return found ? found.label : "";
}

export default function StudentProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("personal-info")
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [profileData, setProfileData] = useState<any>(null); // store loaded profile for comparison
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Personal Information Form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      departmentName: "",
      academicYear: "",
      gender: "",
      dateOfBirth: undefined,
      universityIdNumber: "",
      email: "",
    },
  })

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await api.get("/Student/profile");
        const data = response.data;
        setProfileData(data); // store for change detection
        personalInfoForm.reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          departmentName: data.departmentName || "",
          academicYear: getAcademicYearLabel(data.academicYear || ""),
          gender: getGenderLabel(data.gender || ""),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          universityIdNumber: data.universityIdNumber || "",
          email: data.email || "",
        });
      } catch (error) {
        toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    async function fetchDepartments() {
      try {
        const data = await DepartmentService.getDepartments();
        setDepartments(data);
      } catch (error) {
        setDepartments([]);
      }
    }
    fetchProfile();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Password Change Form
  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const isFormChanged = (() => {
    if (!profileData) return false;
    const values = personalInfoForm.getValues();
    // Find departmentId for selected departmentName
    const department = departments.find(d => d.name === values.departmentName);
    return (
      values.firstName !== (profileData.firstName || "") ||
      values.lastName !== (profileData.lastName || "") ||
      (department && department.id !== profileData.departmentId) ||
      values.academicYear.toLowerCase() !== (profileData.academicYear || "").toLowerCase() ||
      values.gender.toLowerCase() !== (profileData.gender || "").toLowerCase() ||
      (values.dateOfBirth && profileData.dateOfBirth && (new Date(values.dateOfBirth).toISOString().split("T")[0] !== new Date(profileData.dateOfBirth).toISOString().split("T")[0]))
    );
  })();

  const isPasswordDirty = passwordChangeForm.formState.isDirty;

  // Handle Personal Information Form Submission
  const onPersonalInfoSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    setIsSubmitting(true);
    try {
      const department = departments.find(d => d.name === values.departmentName);
      await api.put("/Student/edit-profile", {
        firstName: values.firstName,
        lastName: values.lastName,
        departmentId: department ? department.id : undefined,
        academicYear: values.academicYear.toLowerCase(),
        gender: values.gender.toLowerCase(),
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      });
      toast({ title: "Success", description: "Profile updated successfully" });
      setLoading(true);
      // Refetch profile to update state
      const response = await api.get("/Student/profile");
      setProfileData(response.data);
      personalInfoForm.reset({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        departmentName: response.data.departmentName || "",
        academicYear: getAcademicYearLabel(response.data.academicYear || ""),
        gender: getGenderLabel(response.data.gender || ""),
        dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth) : undefined,
        universityIdNumber: response.data.universityIdNumber || "",
        email: response.data.email || "",
      });
      setLoading(false);
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to update profile.", variant: "destructive" });
      setLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Change Form Submission
  const onPasswordChangeSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    try {
      const response = await api.post("/Auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      const data = response.data;
      toast({
        title: "Password Changed",
        description: data.message || "Your password has been changed successfully.",
      });
      passwordChangeForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal-info">Personal Information</TabsTrigger>
            <TabsTrigger value="change-password">Change Password</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal-info">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              {loading ? (
                <div className="py-8 text-center text-gray-500">Loading profile...</div>
              ) : (
                <Form {...personalInfoForm}>
                  <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <FormField
                          control={personalInfoForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalInfoForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        {/* Email (Non-editable) */}
                        <FormField
                          control={personalInfoForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" readOnly className="bg-gray-100 cursor-not-allowed" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                          />
                          <p className="text-xs text-gray-500">
                            Email cannot be changed
                          </p>
                          </div>
                          

                        {/* Department */}
                        <FormField
                          control={personalInfoForm.control}
                          name="departmentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <CustomSelect value={field.value} onChange={field.onChange} placeholder="Select department">
                                {departments.map((dept) => (
                                  <CustomSelectOption key={dept.id} value={dept.name}>{dept.name}</CustomSelectOption>
                                ))}
                              </CustomSelect>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Academic Year */}
                        <FormField
                          control={personalInfoForm.control}
                          name="academicYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Year</FormLabel>
                              <CustomSelect value={field.value} onChange={field.onChange} placeholder="Select academic year">
                                {ACADEMIC_YEARS.map((year) => (
                                  <CustomSelectOption key={year.value} value={year.label}>{year.label}</CustomSelectOption>
                                ))}
                              </CustomSelect>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Gender */}
                        <FormField
                          control={personalInfoForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <CustomSelect value={field.value} onChange={field.onChange} placeholder="Select gender">
                                {GENDERS.map((g) => (
                                  <CustomSelectOption key={g.value} value={g.label}>{g.label}</CustomSelectOption>
                                ))}
                              </CustomSelect>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date of Birth */}
                        <FormField
                          control={personalInfoForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value) : ''}
                                  onChange={e => field.onChange(new Date(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* University ID */}
                        <FormField
                          control={personalInfoForm.control}
                          name="universityIdNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>University ID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="bg-[#FF9814] hover:bg-orange-600" disabled={!isFormChanged || isSubmitting}>
                        {isSubmitting ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : <Save className="mr-2 h-4 w-4" />}
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              )}
            </Card>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="change-password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <Form {...passwordChangeForm}>
                <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)}>
                  <CardContent className="space-y-4">
                    {/* Current Password */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showCurrent ? "text" : "password"} />
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowCurrent(v => !v)}>
                                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New Password */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showNew ? "text" : "password"} />
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowNew(v => !v)}>
                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription>Password must be at least 8 characters long.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showConfirm ? "text" : "password"} />
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}>
                                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={!isPasswordDirty || isSubmitting}>
                      {isSubmitting ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : <Save className="mr-2 h-4 w-4" />}
                      {isSubmitting ? "Saving..." : "Change Password"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
