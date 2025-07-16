// src/pages/ForgotPassword.tsx

import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";

/**
 * ForgotPassword page component.
 * Allows users to submit their email to receive password reset instructions.
 * Shows status messages for success or error.
 */
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  /**
   * Handles form submission by sending the email to the backend.
   * Updates status and messages accordingly.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage("");
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setStatus("success");
      setMessage("If this email is registered, you will receive reset instructions.");
    } catch {
      setStatus("error");
      setMessage("Failed to send reset email.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

      {/* Status message */}
      {message && (
        <p className={status === "success" ? "text-green-600" : "text-red-600"}>
          {message}
        </p>
      )}

      {/* Email input */}
      <label className="block mb-4">
        Email
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
      >
        Send Reset Email
      </button>
    </form>
  );
};

export default ForgotPassword;
