import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userType = localStorage.getItem('userType');

      console.log("useAuth Debug:", {
        token: token ? "EXISTS" : "MISSING",
        userId,
        userEmail,
        userType,
        hasToken: !!token,
        tokenStartsWith: token ? token.substring(0, 20) + "..." : "N/A"
      });

      if (token && userId && userEmail && userType) {
        // Check if token is not a temporary one
        if (!token.startsWith('temp_') && !token.startsWith('google_session_')) {
          console.log("Token is valid JWT, setting authenticated to true");
          setIsAuthenticated(true);
          setUser({
            id: userId,
            email: userEmail,
            userType: userType,
            token: token
          });
        } else {
          console.log("Token is temporary, setting authenticated to false");
          // Token exists but is temporary - user needs to complete profile
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log("Missing required auth data, setting authenticated to false");
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userGender');
    localStorage.removeItem('userDateOfBirth');
    localStorage.removeItem('userProfilePicture');
    localStorage.removeItem('profileCompleted');
    localStorage.removeItem('user');
    
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, loading, logout };
} 