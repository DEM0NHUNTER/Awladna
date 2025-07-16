// src/components/auth/RegisterForm.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * ✅ RegisterForm component
 * - Handles user registration.
 * - Includes validation (password length, match).
 * - Supports i18n and language switching.
 * - Redirects logged-in users automatically.
 */
const RegisterForm: React.FC = () => {
  const auth = useAuth();                 // Access authentication methods/state
  const navigate = useNavigate();         // Router navigation
  const { t } = useTranslation();         // i18n translation

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (auth?.user) {
      navigate("/dashboard");
    }
  }, [auth?.user, navigate]);

  // Handle missing auth system (context failed)
  if (!auth?.register) {
    return (
      <div className="text-center text-red-600 font-bold mt-20">
        {t("errors.authNotReady", "Authentication system is not available.")}
      </div>
    );
  }

  // ✅ Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("errors.passwordsDoNotMatch", "Passwords do not match"));
      return;
    }

    if (password.length < 6) {
      setError(t("errors.passwordTooShort", "Password must be at least 6 characters long"));
      return;
    }

    setLoading(true);
    try {
      await auth.register(email, password);
      navigate("/login");  // Redirect after successful registration
    } catch {
      setError(t("errors.registrationFailed", "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Component rendering (UI)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fd] py-12 px-4 sm:px-6 lg:px-8 relative">

      {/* Language selector in top-right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("createAccount", "Create Account")}
          </h1>
          <p className="text-gray-600">
            {t("joinUs", "Join us and start your parenting journey")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t("emailAddress", "Email Address")}
              </label>
              <input
                id="email"
                type="email"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t("enterEmail", "Enter your email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t("password", "Password")}
              </label>
              <input
                id="password"
                type="password"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t("enterPassword", "Create a password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("passwordMinLength", "Must be at least 6 characters")}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmPassword", "Confirm Password")}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t("enterConfirmPassword", "Confirm your password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Terms acceptance */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                {t("agreeTo", "I agree to the")}&nbsp;
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                  {t("termsOfService", "Terms of Service")}
                </Link>{" "}
                {t("and", "and")}&nbsp;
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                  {t("privacyPolicy", "Privacy Policy")}
                </Link>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("creatingAccount", "Creating account...")}
                </div>
              ) : (
                t("createAccount", "Create Account")
              )}
            </button>
          </form>

          {/* Redirect link to login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {t("alreadyHaveAccount", "Already have an account?")}&nbsp;
            <Link to="/login" className="text-blue-600 hover:underline">
              {t("signInToExisting", "Sign in to existing account")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ LanguageSwitcher component for toggling app language
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change language"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
        </svg>
        <span>{current.label}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${
                i18n.language === lang.code ? "bg-blue-100 font-bold" : ""
              }`}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegisterForm;

