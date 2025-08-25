"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Department {
  Id: number;
  Name: string;
}

interface Profile {
  DepartmentId?: number;
  UniversityIdNumber?: string;
  AcademicYear?: string;
  DateOfBirth?: string;
}

export default function CompleteProfilePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [universityId, setUniversityId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  // Debug state changes
  useEffect(() => {
    console.log("State changed:", {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      departmentId,
      universityId,
      academicYear
    });
  }, [firstName, lastName, gender, dateOfBirth, departmentId, universityId, academicYear]);

  // Load user & profile on mount
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
      userLastName: localStorage.getItem("userLastName"),
      userGender: localStorage.getItem("userGender"),
      userDateOfBirth: localStorage.getItem("userDateOfBirth")
    });
    
    if (!storedUserId || !storedAuthToken) {
      console.log("Missing userId or authToken, redirecting to login");
      setStatus({
        message: "Authentication required. Please sign in again.",
        type: "error",
      });
      setTimeout(() => router.push("/google-signin"), 3000);
      return;
    }
    
    // Check if token is valid (not a temporary token)
    if (storedAuthToken.startsWith("temp_") || storedAuthToken.startsWith("google_session_")) {
      console.log("Token is temporary, showing info message");
      setStatus({
        message: "Please complete your profile to activate your account.",
        type: "info",
      });
    }
    
    setUserId(storedUserId);

    // Load user info from Google login
    const storedFirstName = localStorage.getItem("userFirstName");
    const storedLastName = localStorage.getItem("userLastName");
    const storedGender = localStorage.getItem("userGender");
    const storedDateOfBirth = localStorage.getItem("userDateOfBirth");
    
    console.log("Setting form fields with Google data:", {
      firstName: storedFirstName,
      lastName: storedLastName,
      gender: storedGender,
      dateOfBirth: storedDateOfBirth
    });
    
    if (storedFirstName) {
      console.log("Setting firstName to:", storedFirstName);
      setFirstName(storedFirstName);
    }
    if (storedLastName) {
      console.log("Setting lastName to:", storedLastName);
      setLastName(storedLastName);
    }
    if (storedGender) {
      console.log("Setting gender to:", storedGender);
      setGender(storedGender);
    }
    if (storedDateOfBirth) {
      console.log("Setting dateOfBirth to:", storedDateOfBirth);
      setDateOfBirth(storedDateOfBirth);
    }

    console.log("Current state after setting Google data:", {
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      dateOfBirth: dateOfBirth
    });

    loadProfile();
    loadDepartments();
    
    console.log("=== CompleteProfilePage useEffect END ===");
  }, [router, isAuthorized]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      console.log("Loading profile with token:", token ? "EXISTS" : "MISSING");
      
      const res = await fetch("/api/auth/current-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data: Profile = await res.json();
        console.log("Profile data from backend:", data);
        setProfile(data);
        if (data.UniversityIdNumber && !data.UniversityIdNumber.startsWith("TEMP_")) {
          setUniversityId(data.UniversityIdNumber);
        }
        if (data.AcademicYear) setAcademicYear(data.AcademicYear);
        if (data.DepartmentId) setDepartmentId(data.DepartmentId);
      } else {
        console.log("Failed to load profile, status:", res.status);
      }
    } catch (err) {
      console.error("Error loading profile", err);
    }
  }

  function loadDepartments() {
    // Hardcoded for now
    const depts: Department[] = [
      { Id: 1, Name: "Computer Science" },
      { Id: 2, Name: "Communication Engineering" },
      { Id: 3, Name: "Medical Engineering" },
    ];
    setDepartments(depts);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!departmentId) {
      setStatus({ message: "Please select a valid department.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ message: "Passwords do not match", type: "error" });
      return;
    }
    if (password.length < 8) {
      setStatus({
        message: "Password must be at least 8 characters long",
        type: "error",
      });
      return;
    }

    // Format gender and dateOfBirth for backend
    console.log("Gender conversion debug:", {
      originalGender: gender,
      genderType: typeof gender,
      genderLowerCase: gender.toLowerCase(),
      genderTrimmed: gender.trim().toLowerCase(),
      isMale: gender.trim().toLowerCase() === "male",
      isFemale: gender.trim().toLowerCase() === "female"
    });
    
    // Send gender as string, not number (backend expects "male", "female")
    const genderValue = gender.trim().toLowerCase();
    
    console.log("Gender value after conversion:", genderValue);
    
    const dateOfBirthFormatted = dateOfBirth ? dateOfBirth.split("T")[0] : "";

    const formData = {
      firstName,
      lastName,
      gender: genderValue,
      dateOfBirth: dateOfBirthFormatted,
      departmentId,
      universityIdNumber: universityId,
      academicYear,
      password,
      confirmPassword,
    };

    console.log("Submitting form data:", formData);
    console.log("Current state values:", {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      departmentId,
      universityId,
      academicYear
    });

    setLoading(true);
    setStatus({ message: "Updating profile...", type: "loading" });

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
          message: "Profile completed successfully! Redirecting...",
          type: "success",
        });
        // Mark profile as completed
        localStorage.setItem("profileCompleted", "true");
        console.log("Profile marked as completed, redirecting to dashboard...");
        // Redirect immediately
        router.push("/dashboard");
      } else {
        const err = await res.json();
        if (err.errors) {
          const msgs = Object.values(err.errors).flat().join(", ");
          setStatus({ message: `Validation errors: ${msgs}`, type: "error" });
        } else if (err.message) {
          setStatus({ message: err.message, type: "error" });
        } else {
          setStatus({ message: "Failed to complete profile", type: "error" });
        }
      }
    } catch (err) {
      console.error(err);
      setStatus({
        message: "An error occurred while completing your profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">
          Complete Your Profile
        </h1>
        
        {/* Show loading while checking authorization */}
        {!isAuthorized && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authorization...</p>
          </div>
        )}
        
        {/* Only show form if authorized */}
        {isAuthorized && (
          <>
            <p className="text-center text-gray-600 mb-6">
              Please provide the following information to complete your profile setup.
            </p>

            {/* Debug info */}
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong><br/>
              firstName: "{firstName}"<br/>
              lastName: "{lastName}"<br/>
              gender: "{gender}"<br/>
              dateOfBirth: "{dateOfBirth}"<br/>
              departmentId: "{departmentId}"<br/>
              universityId: "{universityId}"<br/>
              academicYear: "{academicYear}"
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Gender (from Google)</label>
                <input
                  type="text"
                  value={gender}
                  readOnly
                  className="w-full border rounded p-2 bg-gray-100"
                  placeholder="Gender from Google"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Date of Birth (from Google)</label>
                <input
                  type="text"
                  value={dateOfBirth}
                  readOnly
                  className="w-full border rounded p-2 bg-gray-100"
                  placeholder="Date of birth from Google"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(parseInt(e.target.value))}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.Id} value={d.Id}>
                      {d.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">University ID Number *</label>
                <input
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                  placeholder="Enter your university ID"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Academic Year *</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Academic Year</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                  <option value="Fifth">Fifth</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                  placeholder="Enter a password"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border rounded p-2"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Processing..." : "Complete Profile"}
              </button>
            </form>
          </>
        )}

        {status && (
          <div
            className={`mt-4 p-3 rounded text-center ${
              status.type === "success"
                ? "bg-green-100 text-green-700"
                : status.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
