"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronDown, ShoppingCart, User, PlusCircle, Award, ArrowLeft, LogOut, History, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/services/auth-service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserService } from "@/lib/services/user-service";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("surveys")
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pointsDropdownOpen, setPointsDropdownOpen] = useState(false);

  useEffect(() => {
    // Helper to get cookie value
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }

    const token = getCookie('token');
    const role = getCookie('role');
    if (!token) {
      router.replace('/auth/signin');
      return;
    }
    // Role-based protection
    const path = window.location.pathname;
    if (path.startsWith('/dashboard/admin') && role !== 'Admin') {
      router.replace('/dashboard/' + (role === 'Teacher' ? 'teacher' : 'student'));
      return;
    }
    if (path.startsWith('/dashboard/teacher') && role !== 'Teacher') {
      router.replace('/dashboard/' + (role === 'Admin' ? 'admin' : 'student'));
      return;
    }
    if (path.startsWith('/dashboard/student') && role !== 'Student') {
      router.replace('/dashboard/' + (role === 'Admin' ? 'admin' : 'teacher'));
      return;
    }
    setLoading(false);
  }, [router])

  useEffect(() => {
    async function fetchName() {
      try {
        const profile = await UserService.getCurrentUserProfile();
        let data: any = profile;
        if (profile && typeof profile === 'object' && 'data' in profile && profile.data) {
          data = profile.data;
        }
        let computedName = '';
        if (data && typeof data === 'object') {
          if ('firstName' in data && 'lastName' in data && data.firstName && data.lastName) {
            computedName = `${data.firstName} ${data.lastName}`;
          } else if ('firstName' in data && data.firstName) {
            computedName = data.firstName;
          } else if ('lastName' in data && data.lastName) {
            computedName = data.lastName;
          } else if ('email' in data && data.email) {
            computedName = data.email;
          }
        }
        setUserName(computedName);
      } catch (err) {
        const user = AuthService.getCurrentUser();
        if (user) setUserName(user.email);
      }
    }
    fetchName();
    // Listen for profile-updated event
    const handler = () => fetchName();
    window.addEventListener('profile-updated', handler);
    return () => {
      window.removeEventListener('profile-updated', handler);
    };
  }, []);

  // Get role from cookie (client-side)
  let role: string | undefined = undefined;
  if (typeof document !== 'undefined') {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const part = parts.pop();
        if (part) return part.split(';').shift();
      }
      return undefined;
    };
    role = getCookie('role');
  }

  let title = '';
  let subtitle = '';
  if (role === 'Admin') {
    title = 'Admin Dashboard';
    subtitle = 'Full access to all system data and user management';
  } else if (role === 'Teacher') {
    title = 'Teacher Dashboard';
            subtitle = 'Manage your surveys and view statistics';
  } else {
    title = 'Student Dashboard';
    subtitle = 'Browse and participate in surveys';
  }

  // Dynamic button links based on role
  let profileLink = '/dashboard/student/profile';
  let createSurveyLink = '';
  let userManagementLink = '';
  let allSurveysLink = '';
  if (role === 'Admin') {
    profileLink = '/dashboard/admin/profile';
    userManagementLink = '/dashboard/admin/users';
    createSurveyLink = '/dashboard/admin/create-survey';
    allSurveysLink = '/dashboard/admin/all-surveys';
  } else if (role === 'Teacher') {
    profileLink = '/dashboard/teacher/profile';
    createSurveyLink = '/dashboard/teacher/create-survey';
  } else {
    profileLink = '/dashboard/student/profile';
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (!href) return false;
    if (href === '/dashboard/teacher/profile') return pathname === '/dashboard/teacher/profile' || pathname === '/dashboard/teacher/profile/';
    if (href === '/dashboard/teacher/create-survey') return pathname === '/dashboard/teacher/create-survey' || pathname === '/dashboard/teacher/create-survey/';
    if (href === '/dashboard/student/profile') return pathname === '/dashboard/student/profile' || pathname === '/dashboard/student/profile/';
    if (href === '/dashboard/student/participation-history') return pathname === '/dashboard/student/participation-history' || pathname === '/dashboard/student/participation-history/';
    if (href === '/dashboard/admin/users') return pathname.startsWith('/dashboard/admin/users');
    if (href === '/dashboard/admin/departments') return pathname.startsWith('/dashboard/admin/departments');
    if (href === '/dashboard/admin/create-survey') return pathname === '/dashboard/admin/create-survey' || pathname === '/dashboard/admin/create-survey/';
    if (href === '/dashboard/admin/all-surveys') return pathname === '/dashboard/admin/all-surveys' || pathname === '/dashboard/admin/all-surveys/';
    return pathname === href;
  };

  // Helper to determine if we are on a subpage (not the main dashboard page)
  const isDashboardMainPage =
    (role === 'Admin' && (pathname === '/dashboard/admin' || pathname === '/dashboard/admin/')) ||
    (role === 'Teacher' && (pathname === '/dashboard/teacher' || pathname === '/dashboard/teacher/')) ||
    (role === 'Student' && (pathname === '/dashboard/student' || pathname === '/dashboard/student/'));

  const handleLogout = () => {
    AuthService.logout();
    router.replace("/auth/signin");
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200); // 200ms delay
  };

  const pointsDropdownRef = useRef<HTMLDivElement>(null);
  const pointsCloseTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePointsMouseEnter = () => {
    if (pointsCloseTimeout.current) {
      clearTimeout(pointsCloseTimeout.current);
      pointsCloseTimeout.current = null;
    }
    setPointsDropdownOpen(true);
  };

  const handlePointsMouseLeave = () => {
    pointsCloseTimeout.current = setTimeout(() => {
      setPointsDropdownOpen(false);
    }, 200); // 200ms delay
  };

  // Remove the outside click handler effect

  // Student points state
  const [studentPoints, setStudentPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'Student') {
      setPointsLoading(true);
      setPointsError(null);
      UserService.getStudentPointsBalance()
        .then((balance) => {
          setStudentPoints(balance);
          setPointsLoading(false);
        })
        .catch((err) => {
          setPointsError('Error');
          setPointsLoading(false);
        });
    }
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <span className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg mb-6" />
        <span className="text-gray-600 text-lg">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 h-20 flex items-center">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="bg-emerald-500 text-white p-2 rounded-md mr-2">
                <span className="font-bold">SurveyDU</span>
              </div>
            </Link>
            {/* Title and subtitle right next to system name */}
            <div className="flex flex-col justify-center ml-4">
              <span className="text-2xl font-bold text-gray-900 leading-tight">{title}</span>
              <span className="text-gray-500 text-sm leading-tight">{subtitle}</span>
            </div>
            <nav className="hidden md:flex ml-8 space-x-1"></nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Admin Buttons */}
            {role === 'Admin' && (
              <>
                {/* <Button 
                  variant={isActive(createSurveyLink) ? undefined : "outline"} 
                  className={isActive(createSurveyLink) 
                    ? "gap-2 bg-emerald-100 text-emerald-700 font-bold shadow-sm" 
                    : "gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  } 
                  asChild
                >
                  <Link href={createSurveyLink}><PlusCircle className="h-4 w-4" /> Create Survey</Link>
                </Button> */}
                <Button 
                  variant={isActive(allSurveysLink) ? undefined : "outline"} 
                  className={isActive(allSurveysLink) 
                    ? "gap-2 btn-emerald-active" 
                    : "gap-2 btn-emerald"
                  } 
                  asChild
                >
                  <Link href={allSurveysLink}> All Surveys</Link>
                </Button>
                <Button 
                  variant={isActive(userManagementLink) ? undefined : "outline"} 
                  className={isActive(userManagementLink) 
                    ? "gap-2 btn-blue-active" 
                    : "gap-2 btn-blue"
                  } 
                  asChild
                >
                  <Link href={userManagementLink}>User Management</Link>
                </Button>
                <Button 
                  variant={isActive('/dashboard/admin/departments') ? undefined : "outline"} 
                  className={isActive('/dashboard/admin/departments') 
                    ? "gap-2 btn-purple-active" 
                    : "gap-2 btn-purple"
                  } 
                  asChild
                >
                  <Link href="/dashboard/admin/departments">Departments</Link>
                </Button>
                {/* User Profile Dropdown (Custom) */}
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Button
                    variant="outline"
                    className="gap-2 min-w-[120px] justify-between btn-orange"
                    asChild
                  >
                    <Link href={profileLink}>
                      <User className="h-4 w-4 text-orange-600 hover:text-orange-700" />
                      {userName.trim() ? (
                        <span>{userName.trim()}</span>
                      ) : (
                        <span className="animate-pulse text-gray-400">Loading...</span>
                      )}
                    </Link>
                  </Button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-36 rounded-lg shadow-xl bg-gradient-to-b from-orange-50 to-amber-50 border border-orange-200 z-50 max-h-[60vh] overflow-y-auto"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={() => {
                          window.location.href = profileLink;
                        }}
                      >
                        <User className="h-4 w-4 text-orange-600" />
                        Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={handleLogout}
                      >
                        <LogOut className="h-4 w-4 text-orange-600" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Teacher Buttons */}
            {role === 'Teacher' && (
              <>
                <Button 
                  variant={isActive(createSurveyLink) ? undefined : "outline"} 
                  className={isActive(createSurveyLink) 
                    ? "gap-2 btn-emerald-active" 
                    : "gap-2 btn-emerald"
                  } 
                  asChild
                >
                  <Link href={createSurveyLink}><PlusCircle className="h-4 w-4" /> Create Survey</Link>
                </Button>
                {/* User Profile Dropdown (Custom) - always last */}
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Button
                    variant="outline"
                    className="gap-2 min-w-[120px] justify-between btn-orange"
                    asChild
                  >
                    <Link href={profileLink}>
                      <User className="h-4 w-4 text-orange-600 hover:text-orange-700" />
                      {userName.trim() ? (
                        <span>{userName.trim()}</span>
                      ) : (
                        <span className="animate-pulse text-gray-400">Loading...</span>
                      )}
                    </Link>
                  </Button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-36 rounded-lg shadow-xl bg-gradient-to-b from-orange-50 to-amber-50 border border-orange-200 z-50 max-h-[60vh] overflow-y-auto"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={() => {
                          window.location.href = profileLink;
                        }}
                      >
                        <User className="h-4 w-4 text-orange-600" />
                        Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={handleLogout}
                      >
                        <LogOut className="h-4 w-4 text-orange-600" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Student Buttons and Points */}
            {role === 'Student' && (
              <>
                <Button 
                  variant={isActive('/dashboard/student/participation-history') ? undefined : "outline"} 
                  className={isActive('/dashboard/student/participation-history') 
                    ? "gap-2 bg-emerald-100 text-emerald-700 font-bold shadow-sm" 
                    : "gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-200 text-emerald-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  } 
                  asChild
                >
                  <Link href="/dashboard/student/participation-history"><History className="h-4 w-4" /> Participation History</Link>
                </Button>
                <div 
                  className="relative"
                  ref={pointsDropdownRef}
                  onMouseEnter={handlePointsMouseEnter}
                  onMouseLeave={handlePointsMouseLeave}
                >
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    asChild
                  >
                    <Link href="/dashboard/student/points-history">
                      <Award className="h-4 w-4 text-blue-600" />
                      {pointsLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : pointsError ? (
                        <span className="text-red-500">{pointsError}</span>
                      ) : (
                        <span>{studentPoints} Points</span>
                      )}
                    </Link>
                  </Button>
                  {pointsDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white border border-blue-200 z-50 overflow-hidden"
                      onMouseEnter={handlePointsMouseEnter}
                      onMouseLeave={handlePointsMouseLeave}
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Current Balance</span>
                          <span className="text-lg font-bold text-blue-900">{studentPoints} points</span>
                        </div>
                      </div>
                      <Link 
                        href="/dashboard/student/points-history"
                        className="flex items-center w-full px-4 py-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 text-left transition-all duration-200 group"
                      >
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3 group-hover:bg-emerald-200 transition-colors">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-emerald-700">Points History</p>
                          <p className="text-sm text-gray-600">View transaction history</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                {/* User Profile Dropdown (Custom) */}
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Button
                    variant="outline"
                    className="gap-2 min-w-[120px] justify-between btn-orange"
                    asChild
                  >
                    <Link href={profileLink}>
                      <User className="h-4 w-4 text-orange-600 hover:text-orange-700" />
                      {userName.trim() ? (
                        <span>{userName.trim()}</span>
                      ) : (
                        <span className="animate-pulse text-gray-400">Loading...</span>
                      )}
                    </Link>
                  </Button>
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-36 rounded-lg shadow-xl bg-gradient-to-b from-orange-50 to-amber-50 border border-orange-200 z-50 max-h-[60vh] overflow-y-auto"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={() => {
                          window.location.href = profileLink;
                        }}
                      >
                        <User className="h-4 w-4 text-orange-600" />
                        Profile
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 text-orange-800 hover:text-orange-900 flex items-center gap-2 font-semibold transition-all duration-200"
                        onMouseDown={handleLogout}
                      >
                        <LogOut className="h-4 w-4 text-orange-600" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Back to Dashboard button in header, only on subpages */}
            {!isDashboardMainPage && (
              <Button 
                variant="outline" 
                className="gap-2 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-blue-50 hover:to-indigo-50 border-gray-200 hover:border-blue-200 text-gray-800 hover:text-blue-800 font-semibold shadow-sm hover:shadow-md transition-all duration-200" 
                asChild
              >
                <Link href={
                  role === 'Admin' ? '/dashboard/admin' :
                  role === 'Teacher' ? '/dashboard/teacher' :
                  '/dashboard/student'
                }>
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 pt-20">{children}</main>
    </div>
  )
}
