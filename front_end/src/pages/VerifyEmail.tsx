// src/pages/VerifyEmail.tsx

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

/**
 * VerifyEmail component handles the email verification process when the user
 * visits the verification link with a token.
 * 
 * Features:
 * - Reads the token from the URL query parameters.
 * - Sends token to backend endpoint to verify the email.
 * - Displays status messages for idle, success, error, or already verified.
 * - Automatically refreshes auth user state after successful verification.
 * - Redirects the user to login page after a short delay on success.
 * - Allows resending the verification email.
 */
const VerifyEmail: React.FC = () => {
  // Extract token from query parameters
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // Status states: idle (loading), success, error, or already verified
  const [status, setStatus] = useState<"idle" | "success" | "error" | "verified">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing");
        return;
      }

      try {
        // Post token to backend verification endpoint
        const response = await axiosInstance.post("/auth/verify-email", { token });

        if (response.data.status === "Already verified") {
          setStatus("verified");
        } else {
          setStatus("success");
          setMessage(response.data.status || "Email verified successfully");

          // Refresh authenticated user state
          await refreshUser();

          // Redirect to login page after 2 seconds
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.detail ||
          "Failed to verify email. The token may be expired or invalid."
        );
        console.error("Verification error:", error);
      }
    };

    verify();
  }, [token, navigate, refreshUser]);

  /**
   * Handler to resend the verification email.
   * Currently uses a hardcoded email address and should be adapted to use user email dynamically.
   */
  const handleResendVerification = async () => {
    try {
      const response = await axiosInstance.post("/auth/resend-verification", { email: "test@example.com" });
      setMessage(response.data.status || "Verification email resent");
    } catch (error: any) {
      setMessage("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-6">Email Verification</h2>

        {/* Loading State */}
        {status === "idle" && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {/* Success Message */}
        {status === "success" && (
          <div className="text-green-600 mb-4">
            <p className="text-xl">{message}</p>
          </div>
        )}

        {/* Error Message */}
        {status === "error" && (
          <div className="text-red-600 mb-4">
            <p className="text-xl">{message}</p>
          </div>
        )}

        {/* Already Verified Info */}
        {status === "verified" && (
          <div className="text-blue-600 mb-4">
            <p className="text-xl">This email is already verified.</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Login
        </button>

        <button
          onClick={handleResendVerification}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Resend verification email
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
