"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegistrationService } from "@/lib/services/registration-service";
import { useToast } from "@/hooks/use-toast";
import { GENDERS, ACADEMIC_YEARS } from "@/lib/constants";
import { Eye, EyeOff } from "lucide-react";
import { CustomSelect, CustomSelectOption } from "@/components/ui/custom-select";
import GoogleLogin from "./GoogleLogin";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function StudentSignup() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentLocale, setCurrentLocale } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    academicYear: "",
    gender: "",
    dateOfBirth: "",
    universityIdNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    academicYear: "",
    gender: "",
    dateOfBirth: "",
    universityIdNumber: "",
    password: "",
    confirmPassword: "",
  };
  const initialFormKeys = Object.keys(initialFormData) as (keyof typeof initialFormData)[];
  const isDirty = initialFormKeys.some(key => formData[key] !== initialFormData[key]);

  // Function to translate error messages
  const translateError = (errorMessage: string) => {
    if (errorMessage.includes('do not match')) {
      return t('auth.passwordsDontMatch', currentLocale)
    } else if (errorMessage.includes('must be a string or array type with a minimum length of') || errorMessage.includes('must be at least')) {
      return t('auth.passwordMinLength', currentLocale)
    } else if (errorMessage.includes('already exists') || errorMessage.includes('already exist')) {
      return t('auth.emailAlreadyExists', currentLocale)
    } else if (errorMessage.includes('required')) {
      return t('auth.fieldRequired', currentLocale)
    } else if (errorMessage.includes('must be a string')) {
      return t('auth.fieldMustBeString', currentLocale)
    } else if (errorMessage.includes('minimum length')) {
      return t('auth.fieldMinLength', currentLocale)
    } else if (errorMessage.includes('invalid email')) {
      return t('auth.invalidEmail', currentLocale)
    } else if (errorMessage.includes('invalid format')) {
      return t('auth.invalidFormat', currentLocale)
    } else if (errorMessage.includes('too short')) {
      return t('auth.tooShort', currentLocale)
    } else if (errorMessage.includes('too long')) {
      return t('auth.tooLong', currentLocale)
    } else if (errorMessage.includes('invalid date')) {
      return t('auth.invalidDate', currentLocale)
    } else if (errorMessage.includes('invalid number')) {
      return t('auth.invalidNumber', currentLocale)
    } else if (errorMessage.includes('must be unique')) {
      return t('auth.mustBeUnique', currentLocale)
    } else if (errorMessage.includes('not found')) {
      return t('auth.notFound', currentLocale)
    } else if (errorMessage.includes('invalid gender')) {
      return t('auth.invalidGender', currentLocale)
    } else if (errorMessage.includes('invalid academic year')) {
      return t('auth.invalidAcademicYear', currentLocale)
    } else if (errorMessage.includes('invalid department')) {
      return t('auth.invalidDepartment', currentLocale)
    }
    return errorMessage // Return original message if no translation found
  }

  useEffect(() => {
    RegistrationService.getDepartments().then(setDepartments).catch(() => {
      toast({ title: t('common.error', currentLocale), description: t('auth.failedToLoadDepartments', currentLocale), variant: "destructive" });
    });
  }, [toast, t, currentLocale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAge = (dateString: string) => {
    if (!dateString) return true;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) return t('auth.mustBe18', currentLocale);
    if (age > 35) return t('auth.mustBeUnder35', currentLocale);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    // Validate age before submit
    const ageValidation = validateAge(formData.dateOfBirth);
    if (ageValidation !== true) {
      setErrors((prev: any) => ({ ...prev, dateOfBirth: ageValidation }));
      setIsLoading(false);
      return;
    }
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        departmentId: Number(formData.departmentId),
        academicYear: Number(formData.academicYear),
        gender: Number(formData.gender),
        dateOfBirth: formData.dateOfBirth,
        universityIdNumber: formData.universityIdNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      const res = await RegistrationService.registerStudent(payload);
      router.push("/auth/registration-success");
    } catch (err: any) {
      if (err.errors) {
        // Translate error messages
        const translatedErrors: any = {};
        Object.keys(err.errors).forEach(key => {
          if (Array.isArray(err.errors[key])) {
            translatedErrors[key] = err.errors[key].map((msg: string) => translateError(msg));
          } else {
            translatedErrors[key] = translateError(err.errors[key]);
          }
        });
        setErrors(translatedErrors);
      }
      // Translate the main error message as well
      const translatedMessage = translateError(err.message || t('auth.checkInput', currentLocale));
      toast({ 
        title: t('auth.registrationFailed', currentLocale), 
        description: translatedMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2 sm:p-3 rounded-xl mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="font-bold text-base sm:text-lg">SurveyDU</span>
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
            <CardTitle className="text-2xl">{t('auth.studentSignUp', currentLocale)}</CardTitle>
            <CardDescription>
              {t('auth.studentSignUpDescription', currentLocale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Login Button */}
            <div className="mb-6">
              <GoogleLogin />
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-2 text-gray-400 text-xs uppercase">{t('auth.or', currentLocale)}</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('auth.personalInformation', currentLocale)}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.firstName', currentLocale)}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.lastName', currentLocale)}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email', currentLocale)}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('auth.gender', currentLocale)}</Label>
                    <CustomSelect
                      value={formData.gender}
                      onChange={value => handleSelectChange("gender", value)}
                      placeholder={t('auth.selectGender', currentLocale)}
                    >
                      {GENDERS.map((g) => (
                        <CustomSelectOption key={g.value} value={String(g.value)}>{t(`common.${g.label.toLowerCase()}`, currentLocale)}</CustomSelectOption>
                      ))}
                    </CustomSelect>
                    {errors.Gender && <p className="text-sm text-red-500">{errors.Gender[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('auth.dateOfBirth', currentLocale)}</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      onBlur={e => {
                        const result = validateAge(e.target.value);
                        setErrors((prev: any) => ({ ...prev, dateOfBirth: result === true ? undefined : result }));
                      }}
                    />
                    {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">{t('auth.academicInformation', currentLocale)}</h3>

              <div className="space-y-2">
                <Label htmlFor="departmentId">{t('auth.department', currentLocale)}</Label>
                <CustomSelect
                  value={formData.departmentId}
                  onChange={value => handleSelectChange("departmentId", value)}
                  placeholder={t('auth.selectDepartment', currentLocale)}
                >
                  {departments.map((dept) => (
                    <CustomSelectOption key={dept.id} value={String(dept.id)}>{dept.name}</CustomSelectOption>
                  ))}
                </CustomSelect>
                {errors.DepartmentId && <p className="text-sm text-red-500">{errors.DepartmentId[0]}</p>}
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">{t('auth.academicYear', currentLocale)}</Label>
                  <CustomSelect
                    value={formData.academicYear}
                    onChange={value => handleSelectChange("academicYear", value)}
                    placeholder={t('auth.selectAcademicYear', currentLocale)}
                  >
                    {ACADEMIC_YEARS.map((year) => (
                      <CustomSelectOption key={year.value} value={String(year.value)}>{t(`common.academicYears.${year.label.toLowerCase()}`, currentLocale)}</CustomSelectOption>
                    ))}
                  </CustomSelect>
                  {errors.AcademicYear && <p className="text-sm text-red-500">{errors.AcademicYear[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityIdNumber">{t('auth.universityIdNumber', currentLocale)}</Label>
                  <Input
                    id="universityIdNumber"
                    name="universityIdNumber"
                    value={formData.universityIdNumber}
                    onChange={handleChange}
                    required
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                {errors.Password && <p className="text-sm text-red-500">{Array.isArray(errors.Password) ? errors.Password[0] : errors.Password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword', currentLocale)}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
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
                {errors.ConfirmPassword && <p className="text-sm text-red-500">{Array.isArray(errors.ConfirmPassword) ? errors.ConfirmPassword[0] : errors.ConfirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-3"
                disabled={!isDirty || isLoading}
              >
                {isLoading ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : null}
                {isLoading ? t('auth.registering', currentLocale) : t('navigation.signup', currentLocale)}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500">
              {t('auth.alreadyHaveAccount', currentLocale)}{" "}
              <Link
                href="/auth/signin"
                className="text-emerald-500 hover:underline font-medium"
              >
                {t('navigation.signin', currentLocale)}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
