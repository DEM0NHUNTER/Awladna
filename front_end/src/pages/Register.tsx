// src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import RegisterForm from "../components/auth/RegisterForm";

/**
 * Register component handles user registration flow.
 * It displays the RegisterForm component for input.
 * Upon successful registration, it shows a prompt informing the user
 * that a verification email has been sent, with a button to navigate to
 * the email verification page.
 */
const Register: React.FC = () => {
  // State to toggle display of the verification prompt after registration
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const navigate = useNavigate();

  /**
   * Handler for form submission in RegisterForm.
   * Sends registration data to the backend and shows verification prompt on success.
   */
  const handleRegister = async (formData: any) => {
    try {
      await apiClient.post("/auth/register", formData);
      setShowVerificationPrompt(true);
    } catch (error) {
      // Handle registration error (e.g., show error message) as needed
      console.error("Registration failed:", error);
    }
  };

  // If registration completed, show the verification prompt with navigation button
  if (showVerificationPrompt) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white shadow rounded text-center">
        <p className="mb-4">
          A verification email has been sent to your inbox. Please check your spam folder.
        </p>
        <button
          onClick={() => navigate("/verify-email")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Verification Page
        </button>
      </div>
    );
  }

  // Render the registration form initially
  return <RegisterForm onSubmit={handleRegister} />;
};

export default Register;
