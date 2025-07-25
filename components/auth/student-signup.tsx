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

export default function StudentSignup() {
  const router = useRouter();
  const { toast } = useToast();
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

  useEffect(() => {
    RegistrationService.getDepartments().then(setDepartments).catch(() => {
      toast({ title: "Error", description: "Failed to load departments", variant: "destructive" });
    });
  }, [toast]);

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
    if (age < 18) return "You must be at least 18 years old.";
    if (age > 35) return "You must be no older than 35 years old.";
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
      if (err.errors) setErrors(err.errors);
      toast({ title: "Registration Failed", description: err.message || "Please check your input.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 flex justify-center items-center border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center">
          <div className="bg-emerald-500 text-white p-2 rounded-md mr-2">
            <span className="font-bold">SurveyDU</span>
          </div>
        </Link>
      </header>

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Sign Up</CardTitle>
            <CardDescription>
              Create your student account to participate in surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
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
                <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="gender">Gender</Label>
                    <CustomSelect
                      value={formData.gender}
                      onChange={value => handleSelectChange("gender", value)}
                      placeholder="Select gender"
                    >
                      {GENDERS.map((g) => (
                        <CustomSelectOption key={g.value} value={String(g.value)}>{g.label}</CustomSelectOption>
                      ))}
                    </CustomSelect>
                    {errors.Gender && <p className="text-sm text-red-500">{errors.Gender[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Academic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <CustomSelect
                  value={formData.departmentId}
                  onChange={value => handleSelectChange("departmentId", value)}
                  placeholder="Select department"
                >
                  {departments.map((dept) => (
                    <CustomSelectOption key={dept.id} value={String(dept.id)}>{dept.name}</CustomSelectOption>
                  ))}
                </CustomSelect>
                {errors.DepartmentId && <p className="text-sm text-red-500">{errors.DepartmentId[0]}</p>}
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <CustomSelect
                    value={formData.academicYear}
                    onChange={value => handleSelectChange("academicYear", value)}
                    placeholder="Select academic year"
                  >
                    {ACADEMIC_YEARS.map((year) => (
                      <CustomSelectOption key={year.value} value={String(year.value)}>{year.label}</CustomSelectOption>
                    ))}
                  </CustomSelect>
                  {errors.AcademicYear && <p className="text-sm text-red-500">{errors.AcademicYear[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityIdNumber">University ID Number</Label>
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
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Account Security</h3>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.Password && <p className="text-sm text-red-500">{errors.Password[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.ConfirmPassword && <p className="text-sm text-red-500">{errors.ConfirmPassword[0]}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-3"
                disabled={!isDirty || isLoading}
              >
                {isLoading ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span> : null}
                {isLoading ? "Registering..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-emerald-500 hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
