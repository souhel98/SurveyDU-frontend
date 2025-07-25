import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect all /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token');
    const role = request.cookies.get('role');
    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Role-based protection
    const path = request.nextUrl.pathname;
    if (path.startsWith('/dashboard/admin') && role?.value !== 'Admin') {
      const redirectUrl = new URL(`/dashboard/${role?.value?.toLowerCase() || 'student'}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (path.startsWith('/dashboard/teacher') && role?.value !== 'Teacher') {
      const redirectUrl = new URL(`/dashboard/${role?.value?.toLowerCase() || 'student'}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    if (path.startsWith('/dashboard/student') && role?.value !== 'Student') {
      const redirectUrl = new URL(`/dashboard/${role?.value?.toLowerCase() || 'student'}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 