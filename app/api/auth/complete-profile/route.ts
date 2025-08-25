import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, gender, dateOfBirth, departmentId, universityIdNumber, academicYear, password, confirmPassword } = body;

    // Validation
    if (!firstName || firstName.trim().length === 0) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!lastName || lastName.trim().length === 0) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!gender) {
      return NextResponse.json(
        { message: 'Gender is required' },
        { status: 400 }
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { message: 'Date of birth is required' },
        { status: 400 }
      );
    }

    if (!departmentId && departmentId !== null && departmentId !== '') {
      return NextResponse.json(
        { message: 'Department is required' },
        { status: 400 }
      );
    }

    if (!universityIdNumber && universityIdNumber !== null && universityIdNumber !== '') {
      return NextResponse.json(
        { message: 'University ID is required' },
        { status: 400 }
      );
    }

    if (!academicYear && academicYear !== null && academicYear !== '') {
      return NextResponse.json(
        { message: 'Academic year is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Extract user ID from token (in production, verify JWT)
    const token = authHeader.replace('Bearer ', '');
    
    // For now, we'll use the token to identify the user
    // In production, you should decode and verify the JWT token
    
    try {
      // Update user profile in your backend
      // First, let's try to update the user's password and profile information
      
      console.log('Updating user profile with data:', {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        departmentId,
        universityIdNumber,
        academicYear,
        password
      });

      // Actually call the backend API
      const backendResponse = await fetch(`${API_CONFIG.BASE_URL}/Auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          dateOfBirth,
          departmentId,
          universityIdNumber,
          academicYear,
          password,
          confirmPassword
        })
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error('Backend error:', errorData);
        return NextResponse.json(
          { message: errorData.message || 'Failed to update profile in backend' },
          { status: backendResponse.status }
        );
      }

      const backendResult = await backendResponse.json();
      console.log('Backend response:', backendResult);
      
      return NextResponse.json({ 
        message: 'Profile completed successfully',
        success: true,
        data: backendResult,
        redirectTo: '/dashboard' // Tell frontend where to redirect
      });
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { message: `Failed to update profile: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 