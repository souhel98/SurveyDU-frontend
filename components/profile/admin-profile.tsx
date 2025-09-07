"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

import api from "@/lib/api/axios";
import { AdminService } from "@/lib/services/admin-service";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function AdminProfile() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isProfileDirty = personalInfoForm.formState.isDirty;
  const isPasswordDirty = passwordChangeForm.formState.isDirty;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getProfile();
      personalInfoForm.reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
      });
    } catch {
      toast({
        title: t('common.error', currentLocale),
        description: t('profile.failedToLoadProfile', currentLocale),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPersonalInfoSubmit = async (values: z.infer<typeof personalInfoSchema>) => {
    setIsProfileSubmitting(true);
    try {
      const response = await api.put("/Admin/edit-profile", {
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast({
        title: t('profile.profileUpdated', currentLocale),
        description: response.data.message || t('profile.profileUpdateSuccess', currentLocale),
      });
      await fetchProfile();
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

  const onPasswordChangeSubmit = async (values: z.infer<typeof passwordChangeSchema>) => {
    setIsPasswordSubmitting(true);
    try {
      const response = await api.post("/Auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      toast({
        title: t('profile.changePassword', currentLocale),
        description: response.data.message || t('profile.passwordChangeSuccess', currentLocale),
      });
      passwordChangeForm.reset();
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

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal-info">{t('profile.personalInfo', currentLocale)}</TabsTrigger>
            <TabsTrigger value="change-password">{t('profile.changePassword', currentLocale)}</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
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
                  <CardDescription>{t('profile.personalDetails', currentLocale)}</CardDescription>
                </CardHeader>
                <Form {...personalInfoForm}>
                  <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <p className="text-xs text-gray-500">{t('common.emailCannotBeChanged', currentLocale)}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="bg-[#FF9814] hover:bg-orange-600"
                        disabled={!isProfileDirty || isProfileSubmitting}
                      >
                        {isProfileSubmitting ? (
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {isProfileSubmitting ? t('profile.saving', currentLocale) : t('profile.saveChanges', currentLocale)}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
          </TabsContent>

          {/* Change Password */}
          <TabsContent value="change-password">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.changePassword', currentLocale)}</CardTitle>
                <CardDescription>{t('profile.passwordSecurity', currentLocale)}</CardDescription>
              </CardHeader>
              <Form {...passwordChangeForm}>
                <form onSubmit={passwordChangeForm.handleSubmit(onPasswordChangeSubmit)} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                  <CardContent className="space-y-4">
                    {/* Current */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.currentPassword', currentLocale)}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showCurrent ? "text" : "password"} autoComplete="current-password" />
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                tabIndex={-1}
                                onClick={() => setShowCurrent(v => !v)}
                              >
                                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* New */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.newPassword', currentLocale)}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showNew ? "text" : "password"} autoComplete="new-password" />
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                tabIndex={-1}
                                onClick={() => setShowNew(v => !v)}
                              >
                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription>{t('common.passwordRequirements', currentLocale)}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Confirm */}
                    <FormField
                      control={passwordChangeForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.confirmNewPassword', currentLocale)}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showConfirm ? "text" : "password"} autoComplete="new-password" />
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                tabIndex={-1}
                                onClick={() => setShowConfirm(v => !v)}
                              >
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
                      {isPasswordSubmitting ? (
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
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
