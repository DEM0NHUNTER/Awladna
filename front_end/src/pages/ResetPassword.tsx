// src/pages/ResetPassword.tsx

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

/**
 * ResetPassword component provides a form for the user to reset their password.
 * It expects a reset token in the URL query parameters and requires the user
 * to enter and confirm a new password.
 *
 * Features:
 * - Extracts reset token from URL query params.
 * - Validates that the new password and confirm password fields match.
 * - Submits the new password and token to the backend endpoint.
 * - Displays success or error messages accordingly.
 * - Redirects to login page after successful password reset with a delay.
 */
const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  // Controlled form state for password fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error message for form validation or request failure
  const [error, setError] = useState<string | null>(null);

  // Status tracks form submission state: idle, success, or error
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Handles form submission to reset the password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Send token and new password to backend API
      await axiosInstance.post("/auth/reset-password", { token, password });
      setStatus("success");

      // Redirect user to login page after a 3-second delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch {
      setStatus("error");
      setError("Failed to reset password.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

      {/* Display error messages if any */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Show success message after successful reset */}
      {status === "success" && (
        <p className="text-green-600 mb-4">
          Password reset successfully. Redirecting to login...
        </p>
      )}

      <label className="block mb-2">
        New Password
        <input
          type="password"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </label>

      <label className="block mb-4">
        Confirm Password
        <input
          type="password"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Reset Password
      </button>
    </form>
  );
};

export default ResetPassword;
