"use client";

import { useEffect, useState } from "react";

interface Status {
  message: string;
  type: "success" | "error" | "loading" | "info" | "";
}

// تعريف types لمكتبة Google Identity Services
declare global {
  interface Window {
    google: any;
    tokenClient: any;
  }
}

export default function GoogleLogin() {
  const [status, setStatus] = useState<Status>({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  let idToken: string | null = null;

  // Load Google script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      // Init Token client exactly like your backend
      window.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id:
          "241994328247-iss7k08irjqeendrfpho5t18vi4qh2t6.apps.googleusercontent.com",
        scope:
          "https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read",
        callback: handleAccessToken,
      });

      // Init One Tap / Button exactly like your backend
      window.google.accounts.id.initialize({
        client_id:
          "241994328247-iss7k08irjqeendrfpho5t18vi4qh2t6.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        context: "signin",
        ux_mode: "popup",
        auto_prompt: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn")!,
        {
          theme: "outline",
          size: "large",
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ========= Handlers =========
  function showStatus(message: string, type: Status["type"] = "info") {
    setStatus({ message, type });
  }

  function handleCredentialResponse(response: any) {
    if (response.credential) {
      idToken = response.credential;
      showStatus("Getting additional profile information...", "loading");
      window.tokenClient.requestAccessToken();
    }
  }

    async function handleAccessToken(tokenResponse: any) {
    if (tokenResponse?.access_token) {
      showStatus("Getting user profile from Google...", "loading");
      setLoading(true);

      try {
        // Fetch user info from Google People API
        const peopleResponse = await fetch(
          `https://people.googleapis.com/v1/people/me?personFields=genders,birthdays,names,emailAddresses`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        if (!peopleResponse.ok) {
          throw new Error("Failed to get user profile from Google People API");
        }
        const peopleData = await peopleResponse.json();
        console.log("Google People API Data:", peopleData);

        // Extract fields
        const firstName = peopleData.names?.[0]?.givenName || "";
        const lastName = peopleData.names?.[0]?.familyName || "";
        const gender = peopleData.genders?.[0]?.value || "";
        const dateOfBirth = peopleData.birthdays?.[0]?.date
          ? `${peopleData.birthdays[0].date.year}-${String(peopleData.birthdays[0].date.month).padStart(2, '0')}-${String(peopleData.birthdays[0].date.day).padStart(2, '0')}`
          : "";
        const email = peopleData.emailAddresses?.[0]?.value || "";
        const profilePicture = peopleData.photos?.[0]?.url || "";

        console.log("Extracted Google data:", {
          firstName,
          lastName,
          gender,
          genderRaw: peopleData.genders?.[0],
          dateOfBirth,
          email,
          profilePicture
        });

        const formData = new FormData();
        if (idToken) formData.append("credential", idToken);
        formData.append("g_csrf_token", "token");
        formData.append("access_token", tokenResponse.access_token);

        showStatus("Creating your account...", "loading");

        const authResponse = await fetch("https://mhhmd6g0-001-site1.rtempurl.com/api/auth/google-callback", {
          method: "POST",
          body: formData,
        });

        if (!authResponse.ok) {
          const err = await authResponse.json();
          throw new Error(err.message || "Authentication failed");
        }

        const data = await authResponse.json();
        showStatus("Authentication successful!", "success");

        // Store the token and Google user info for profile completion
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userType", data.userType);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userFirstName", firstName);
        localStorage.setItem("userLastName", lastName);
        localStorage.setItem("userGender", gender);
        localStorage.setItem("userDateOfBirth", dateOfBirth);
        localStorage.setItem("userProfilePicture", profilePicture);
        
        // Store user object as expected by the system
        localStorage.setItem("user", JSON.stringify({
          userId: data.userId,
          email: data.email,
          userType: data.userType,
          token: data.token
        }));
        
        // Set cookies as expected by the system
        document.cookie = `token=${data.token}; path=/`;
        document.cookie = `role=${data.userType}; path=/`;

        // Show appropriate message based on user status
        if (data.isNewUser) {
          showStatus(
            "Welcome! Please complete your profile to continue.",
            "success"
          );
          setTimeout(() => {
            if (data.requiresProfileCompletion) {
              window.location.href = "/auth/student/complete-profile";
            } else {
              window.location.href = "/dashboard";
            }
          }, 2000);
        } else {
          showStatus("Welcome back! Redirecting to dashboard...", "success");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      } catch (error: any) {
        console.error("Error:", error);
        showStatus(`Authentication failed: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    } else {
      showStatus("Failed to get access token from Google", "error");
    }
  }

  // Helper to read cookie
  function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  }

  // ========= Render =========
  return (
    <div className="flex justify-center items-center">
      <div className="w-full">
        
        <div id="googleBtn" className="flex justify-center items-center w-full"></div>

        {loading && (
          <div className="animate-spin mt-4 w-6 h-6 border-4 border-t-blue-500 rounded-full mx-auto"></div>
        )}

        {status.message && (
          <div
            className={`mt-4 p-3 rounded text-left ${
              status.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : status.type === "error"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
