"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import { ACADEMIC_YEARS } from "@/lib/constants";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

interface Department {
  id: number;
  name: string;
}

interface ProfileRequirements {
  userId: string;
  email: string;
  userType: string;
  isProfileComplete: boolean;
  missingFields: string[];
  needsPassword: boolean;
  needsDepartment: boolean;
  needsUniversityId: boolean;
  needsAcademicYear: boolean;
  needsGender: boolean;
  needsDateOfBirth: boolean;
}

export default function CompleteProfilePage() {
  const { t } = useTranslation();
  const { currentLocale, setCurrentLocale } = useLocale();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profileRequirements, setProfileRequirements] = useState<ProfileRequirements | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const [departmentId, setDepartmentId] = useState<string>("");
  const [universityId, setUniversityId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Check user type and redirect if not a student
  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const roleCookie = document.cookie.split('; ').find(row => row.startsWith('role='));
    const role = roleCookie ? roleCookie.split('=')[1] : null;
    
    console.log("User type check:", { userType, role });
    
    // If user is not a student, redirect to appropriate dashboard
    if (userType && userType !== "Student") {
      console.log("User is not a student, redirecting to dashboard");
      if (userType === "Admin") {
        router.replace("/dashboard/admin");
      } else if (userType === "Teacher") {
        router.replace("/dashboard/teacher");
      } else {
        router.replace("/dashboard");
      }
      return;
    }
    
    // If role cookie shows non-student, redirect
    if (role && role !== "Student") {
      console.log("Role cookie shows non-student, redirecting to dashboard");
      if (role === "Admin") {
        router.replace("/dashboard/admin");
      } else if (role === "Teacher") {
        router.replace("/dashboard/teacher");
      } else {
        router.replace("/dashboard");
      }
      return;
    }
    
    // User is authorized (student)
    setIsAuthorized(true);
  }, [router]);

  // Check profile requirements and load user data
  useEffect(() => {
    // Only proceed if user is authorized (student)
    if (!isAuthorized) {
      return;
    }
    
    console.log("=== CompleteProfilePage useEffect START ===");
    
    const storedUserId = localStorage.getItem("userId");
    const storedAuthToken = localStorage.getItem("token");
    
    console.log("CompleteProfilePage useEffect - localStorage data:", {
      userId: storedUserId,
      authToken: storedAuthToken ? "EXISTS" : "MISSING",
      userFirstName: localStorage.getItem("userFirstName"),
      userLastName: localStorage.getItem("userFirstName"),
      userGender: localStorage.getItem("userGender"),
      userDateOfBirth: localStorage.getItem("userDateOfBirth")
    });
    
    if (!storedUserId || !storedAuthToken) {
      console.log("Missing userId or authToken, redirecting to login");
      setStatus({
        message: t('auth.authenticationRequired', currentLocale),
        type: "error",
      });
      setTimeout(() => router.push("/google-signin"), 3000);
      return;
    }
    
    setUserId(storedUserId);

    // Load user info from Google login (only personal info)
    const storedFirstName = localStorage.getItem("userFirstName");
    const storedLastName = localStorage.getItem("userLastName");
    const storedGender = localStorage.getItem("userGender");
    const storedDateOfBirth = localStorage.getItem("userDateOfBirth");
    
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }
    if (storedLastName) {
      setLastName(storedLastName);
    }
    if (storedGender) {
      setGender(storedGender);
    }
    if (storedDateOfBirth) {
      setDateOfBirth(storedDateOfBirth);
    }

    // Check profile requirements first
    checkProfileRequirements();
    loadDepartments();
    
    console.log("=== CompleteProfilePage useEffect END ===");
  }, [router, isAuthorized]);

  // Check if profile is complete using the API
  async function checkProfileRequirements() {
    try {
      const token = localStorage.getItem("token");
      console.log("Checking profile requirements with token:", token ? "EXISTS" : "MISSING");
      
      const response = await fetch("https://mhhmd6g0-001-site1.rtempurl.com/api/Auth/profile-requirements", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data: ProfileRequirements = await response.json();
        console.log("Profile requirements from API:", data);
        setProfileRequirements(data);
        
        // If profile is complete, redirect to dashboard
        if (data.isProfileComplete) {
          console.log("Profile is complete, redirecting to dashboard");
          setStatus({
            message: t('auth.profileAlreadyComplete', currentLocale),
            type: "success",
          });
          setTimeout(() => {
            router.push("/dashboard/student");
          }, 2000);
          return;
        }
        
        // If profile is incomplete, show the form
        console.log("Profile is incomplete, showing form");
        setIsCheckingProfile(false);
        
        // Pre-fill form fields based on what's already available
        if (data.needsDepartment === false) {
          // If department is not needed, it means it's already set
          // You might want to fetch the current department value here
        }
        
      } else {
        console.log("Failed to check profile requirements, status:", response.status);
        // If we can't check requirements, show the form anyway
        setIsCheckingProfile(false);
      }
    } catch (err) {
      console.error("Error checking profile requirements", err);
      // If there's an error, show the form anyway
      setIsCheckingProfile(false);
    }
  }

  async function loadDepartments() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://mhhmd6g0-001-site1.rtempurl.com/api/Department", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error('Failed to fetch departments');
        // Fallback to hardcoded departments
        const depts: Department[] = [
          { id: 1, name: currentLocale === 'ar' ? 'علوم الحاسوب' : 'Computer Science' },
          { id: 2, name: currentLocale === 'ar' ? 'هندسة الاتصالات' : 'Communication Engineering' },
          { id: 3, name: currentLocale === 'ar' ? 'الهندسة الطبية' : 'Medical Engineering' },
        ];
        setDepartments(depts);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to hardcoded departments
      const depts: Department[] = [
        { id: 1, name: currentLocale === 'ar' ? 'علوم الحاسوب' : 'Computer Science' },
        { id: 2, name: currentLocale === 'ar' ? 'هندسة الاتصالات' : 'Communication Engineering' },
        { id: 3, name: currentLocale === 'ar' ? 'الهندسة الطبية' : 'Medical Engineering' },
      ];
      setDepartments(depts);
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "departmentId") {
      setDepartmentId(value);
    } else if (name === "academicYear") {
      setAcademicYear(value);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!departmentId) {
      setStatus({ message: t('auth.selectValidDepartment', currentLocale), type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ message: t('auth.passwordsDontMatch', currentLocale), type: "error" });
      return;
    }
    if (password.length < 8) {
      setStatus({
        message: t('auth.passwordMinLength', currentLocale),
        type: "error",
      });
      return;
    }

    // Format gender and dateOfBirth for backend
    const genderValue = gender.trim().toLowerCase();
    const dateOfBirthFormatted = dateOfBirth ? dateOfBirth.split("T")[0] : "";

    const formData = {
      firstName,
      lastName,
      gender: genderValue,
      dateOfBirth: dateOfBirthFormatted,
      departmentId: Number(departmentId),
      universityIdNumber: universityId,
      academicYear,
      password,
      confirmPassword,
    };

    console.log("Submitting form data:", formData);

    setLoading(true);
    setStatus({ message: t('auth.updatingProfile', currentLocale), type: "loading" });

    try {
      const token = localStorage.getItem("token");
      console.log("Sending to local API route:", {
        url: "/api/auth/complete-profile",
        formData: formData,
        token: token ? "EXISTS" : "MISSING"
      });
      
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Backend response:", result);
        setStatus({
          message: t('auth.profileCompletedSuccessfully', currentLocale),
          type: "success",
        });
        // Mark profile as completed
        localStorage.setItem("profileCompleted", "true");
        console.log("Profile marked as completed, redirecting to dashboard...");
        // Redirect immediately
        router.push("/dashboard/student");
      } else {
        const err = await res.json();
        if (err.errors) {
          const msgs = Object.values(err.errors).flat().join(", ");
          setStatus({ message: `${t('auth.validationErrors', currentLocale)}: ${msgs}`, type: "error" });
        } else if (err.message) {
          setStatus({ message: err.message, type: "error" });
        } else {
          setStatus({ message: t('auth.failedToCompleteProfile', currentLocale), type: "error" });
        }
      }
    } catch (err) {
      console.error(err);
      setStatus({
        message: t('auth.errorCompletingProfile', currentLocale),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Show loading while checking profile requirements
  if (isCheckingProfile) {
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
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('auth.checkingProfileStatus', currentLocale)}</h2>
              <p className="text-gray-600">{t('auth.verifyingProfileRequirements', currentLocale)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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

            {/* Mobile navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setCurrentLocale} />
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
              <LanguageSwitcher currentLocale={currentLocale} onLocaleChange={setCurrentLocale} />
              <Link href="/" className="text-gray-600 hover:text-emerald-500 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-50">
                {t('navigation.home', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('navigation.signin', currentLocale)}
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
                {t('navigation.home', currentLocale)}
              </Link>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('navigation.signin', currentLocale)}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.completeYourProfile', currentLocale)}</CardTitle>
            <CardDescription>
              {t('auth.completeProfileDescription', currentLocale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show loading while checking authorization */}
            {!isAuthorized && (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('auth.checkingAuthorization', currentLocale)}</p>
              </div>
            )}
            
            {/* Only show form if authorized */}
            {isAuthorized && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('auth.personalInformation', currentLocale)}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('auth.firstNameFromGoogle', currentLocale)}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        readOnly
                        className="bg-gray-100"
                        placeholder={t('auth.firstNameFromGoogle', currentLocale)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('auth.lastNameFromGoogle', currentLocale)}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        readOnly
                        className="bg-gray-100"
                        placeholder={t('auth.lastNameFromGoogle', currentLocale)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">{t('auth.genderFromGoogle', currentLocale)}</Label>
                      <Input
                        id="gender"
                        value={gender}
                        readOnly
                        className="bg-gray-100"
                        placeholder={t('auth.genderFromGoogle', currentLocale)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">{t('auth.dateOfBirthFromGoogle', currentLocale)}</Label>
                      <Input
                        id="dateOfBirth"
                        value={dateOfBirth}
                        readOnly
                        className="bg-gray-100"
                        placeholder={t('auth.dateOfBirthFromGoogle', currentLocale)}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('auth.academicInformation', currentLocale)}</h3>

                  <div className="space-y-2">
                    <Label htmlFor="departmentId">{t('auth.department', currentLocale)}</Label>
                    <CustomSelect
                      value={departmentId}
                      onChange={value => handleSelectChange("departmentId", value)}
                      placeholder={t('auth.selectDepartment', currentLocale)}
                    >
                      {departments.map((dept) => (
                        <CustomSelectOption key={dept.id} value={String(dept.id)}>{dept.name}</CustomSelectOption>
                      ))}
                    </CustomSelect>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">{t('auth.academicYear', currentLocale)}</Label>
                      <CustomSelect
                        value={academicYear}
                        onChange={value => handleSelectChange("academicYear", value)}
                        placeholder={t('auth.selectAcademicYear', currentLocale)}
                      >
                        {ACADEMIC_YEARS.map((year) => (
                          <CustomSelectOption key={year.value} value={String(year.value)}>{t(`common.academicYears.${year.label.toLowerCase()}`, currentLocale)}</CustomSelectOption>
                        ))}
                      </CustomSelect>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="universityId">{t('auth.universityIdNumber', currentLocale)}</Label>
                      <Input
                        id="universityId"
                        value={universityId}
                        onChange={(e) => setUniversityId(e.target.value)}
                        required
                        placeholder={t('auth.enterUniversityId', currentLocale)}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('auth.accountSecurity', currentLocale)}</h3>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password', currentLocale)}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t('auth.enterPassword', currentLocale)}
                      />
                      <button
                        type="button"
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none ${currentLocale === 'ar' ? 'left-3' : 'right-3'}`}
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? t('auth.hidePassword', currentLocale) : t('auth.showPassword', currentLocale)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword', currentLocale)}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder={t('auth.confirmYourPassword', currentLocale)}
                      />
                      <button
                        type="button"
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none ${currentLocale === 'ar' ? 'left-3' : 'right-3'}`}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? t('auth.hidePassword', currentLocale) : t('auth.showPassword', currentLocale)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {status && (
                  <div
                    className={`p-4 rounded-lg text-center ${
                      status.type === "success"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : status.type === "error"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : status.type === "loading"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                      {t('auth.processing', currentLocale)}...
                    </>
                  ) : (
                    t('auth.completeProfile', currentLocale)
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
        </Card>
      </div>
    </div>
  );
}
