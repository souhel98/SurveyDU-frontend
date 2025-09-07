"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { GENDERS, ACADEMIC_YEARS } from "@/lib/constants";
import api from "@/lib/api/axios";
import { useEffect } from "react";
import { DepartmentService } from "@/lib/services/department-service";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

// Mock teacher data
const teacherData = {
  id: "T5678",
  firstName: "Dr. Sarah",
  lastName: "almoualem",
  email: "sarah.almoualem@gmail.com",
  department: "هندسة الحواسيب والأتمتة",
  position: "Associate Professor",
  officeLocation: "البناء الاحمر, المكتب 5",
  officeHours: "Monday and Wednesday, 2-4 PM",
  phoneNumber: "+963 985 884 654",
  researchInterests: "Artificial Intelligence, Machine Learning, Data Science",
};

// Personal Information Form Schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  departmentName: z.string({ message: "Please select a department." }),
  email: z.string().email({ message: "Invalid email address." }),
});

// Password Change Form Schema
const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function TeacherProfile() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  // Personal Information Form

  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      departmentName: "",
      email: "",
    },
  });

  // Password Change Form
  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle Personal Information Form Submission
  const onPersonalInfoSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    setIsProfileSubmitting(true);
    try {
      const department = departments.find(d => d.name === values.departmentName);
      await api.put("/Teacher/edit-profile", {
        firstName: values.firstName,
        lastName: values.lastName,
        departmentId: department ? department.id : undefined,
      });
      toast({
        title: t('profile.profileUpdated', currentLocale),
        description: t('profile.profileUpdateSuccess', currentLocale),
      });
      setLoading(true);
      const response = await api.get("/Teacher/profile");
      setProfileData(response.data);
      personalInfoForm.reset({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        departmentName: response.data.departmentName || "",
        email: response.data.email || "",
      });
      setLoading(false);
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error?.response?.data?.message || t('profile.failedToUpdateProfile', currentLocale),
        variant: "destructive",
      });
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Handle Password Change Form Submission
  const onPasswordChangeSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    setIsPasswordSubmitting(true);
    try {
      const response = await api.post("/Auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      const data = response.data;
      toast({
        title: t('profile.changePassword', currentLocale),
        description: data.message || t('profile.passwordChangeSuccess', currentLocale),
      });
      passwordChangeForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: t('common.error', currentLocale),
        description: error?.response?.data?.message || t('profile.failedToChangePassword', currentLocale),
        variant: "destructive",
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // For personal info form
  const isProfileDirty = personalInfoForm.formState.isDirty;
  // For password change form
  const isPasswordDirty = passwordChangeForm.formState.isDirty;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await api.get("/Teacher/profile");
        const data = response.data;
        setProfileData(data);
        personalInfoForm.reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          departmentName: data.departmentName || "",
          email: data.email || "",
        });
      } catch (error) {
        toast({
          title: t('common.error', currentLocale),
          description: t('profile.failedToLoadProfile', currentLocale),
          variant: "destructive",
        });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal-info">{t('profile.personalInfo', currentLocale)}</TabsTrigger>
            <TabsTrigger value="change-password">{t('profile.changePassword', currentLocale)}</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal-info">
            {loading ? (
              <Card>
                <CardContent>
                  <div className="py-8 text-center text-gray-500">{t('common.loadingProfile', currentLocale)}</div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.personalInfo', currentLocale)}</CardTitle>
                  <CardDescription>
                    {t('profile.personalDetails', currentLocale)}
                  </CardDescription>
                </CardHeader>
                <Form {...personalInfoForm}>
                  <form
                    onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}
                    dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <CardContent className="space-y-4">
                      
                        {/* Full Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* First Name */}
                          <FormField
                            control={personalInfoForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.firstName', currentLocale)}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Last Name */}
                          <FormField
                            control={personalInfoForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.lastName', currentLocale)}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Email (Non-editable) */}
                        <div>
                          <FormField
                            control={personalInfoForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.email', currentLocale)}</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" readOnly className="bg-gray-100 cursor-not-allowed" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <p className="text-xs text-gray-500">
                            {t('common.emailCannotBeChanged', currentLocale)}
                          </p>
                        </div>
                      

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Department */}
                        <FormField
                          control={personalInfoForm.control}
                          name="departmentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.department', currentLocale)}</FormLabel>
                              <CustomSelect value={field.value} onChange={field.onChange} placeholder={t('profile.selectDepartment', currentLocale)}>
                                {departments.map((dept) => (
                                  <CustomSelectOption key={dept.id} value={dept.name}>{dept.name}</CustomSelectOption>
                                ))}
                              </CustomSelect>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="bg-[#FF9814] hover:bg-orange-600"
                        disabled={!isProfileDirty || isProfileSubmitting}
                      >
                        {isProfileSubmitting ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : <Save className="mr-2 h-4 w-4" />}
                        {isProfileSubmitting ? t('profile.saving', currentLocale) : t('profile.saveChanges', currentLocale)}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="change-password">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.changePassword', currentLocale)}</CardTitle>
                <CardDescription>
                  {t('profile.passwordSecurity', currentLocale)}
                </CardDescription>
              </CardHeader>
              <Form {...passwordChangeForm}>
                <form
                  onSubmit={passwordChangeForm.handleSubmit(
                    onPasswordChangeSubmit
                  )}
                  dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
                >
                  <CardContent className="space-y-4">
                    {/* Current Password */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.currentPassword', currentLocale)}</FormLabel>
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
                          <FormLabel>{t('profile.newPassword', currentLocale)}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showNew ? "text" : "password"} />
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1} onClick={() => setShowNew(v => !v)}>
                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t('common.passwordRequirements', currentLocale)}
                          </FormDescription>
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
                          <FormLabel>{t('profile.confirmNewPassword', currentLocale)}</FormLabel>
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
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!isPasswordDirty || isPasswordSubmitting}
                    >
                      {isPasswordSubmitting ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : <Save className="mr-2 h-4 w-4" />}
                      {isPasswordSubmitting ? t('profile.saving', currentLocale) : t('profile.changePassword', currentLocale)}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
