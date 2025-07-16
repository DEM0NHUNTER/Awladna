// src/components/auth/LoginForm.tsx

import React, { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import toast from "react-hot-toast";

// ✅ LoginForm component: handles user authentication using email and password.
// Supports localization (i18n), toast notifications, and password visibility toggle.

const LoginForm: React.FC = () => {
  const { login } = useAuth();             // Use login method from AuthContext
  const navigate = useNavigate();          // For future navigation (not used here)
  const { t, i18n } = useTranslation();    // i18n translation hook

  // Form state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);        // Call login from AuthContext
      toast.success("Logged in successfully!");
    } catch {
      setError("Invalid email or password");  // Show basic error message
    } finally {
      setLoading(false);
    }
  };

  // Placeholder social login handlers
  const handleGoogleSignIn = () => alert("Google sign-in not implemented yet.");
  const handleFacebookSignIn = () => alert("Facebook sign-in not implemented yet.");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fd] py-12 px-4 relative">

      {/* Language Switcher (top-right) */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Main form container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 flex flex-col items-center">

          {/* Logo */}
          <div className="mb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              {/* Heart icon */}
              <svg xmlns="http://www.w3.org/2000/svg" ... />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-1">{t('awladna')}</h1>
          <p className="text-gray-500 text-center mb-6">{t('welcomeBack')}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700 text-sm mb-2">
                {t(error)}
              </div>
            )}

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                {/* Email icon */}
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* SVG icon */}
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder={t('enterEmail', 'Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="...input styling..."
                />
              </div>
            </div>

            {/* Password input with toggle */}
            <div>
              <label htmlFor="password" className="...">{t('password')}</label>
              <div className="relative">
                {/* Password icon */}
                <span className="...">
                  {/* SVG icon */}
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('enterPassword', 'Enter your password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="...input styling..."
                />
                {/* Toggle visibility */}
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? ( /* eye-open icon */ ) : ( /* eye-closed icon */ )}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" disabled={loading} className="...button styling...">
              {loading ? t('signingIn', 'Signing in...') : t('signIn', 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 w-full">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-gray-400 font-medium">{t('orContinueWith', 'Or continue with')}</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Social buttons */}
          <button onClick={handleGoogleSignIn} className="...social button styling...">
            {/* Google icon */}
            {t('continueWithGoogle', 'Continue with Google')}
          </button>
          <button onClick={handleFacebookSignIn} className="...social button styling...">
            {/* Facebook icon */}
            {t('continueWithFacebook', 'Continue with Facebook')}
          </button>

          {/* Link to registration */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">{t('dontHaveAccount')} </span>
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              {t('signUpHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// LanguageSwitcher component handles UI language changes
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' }
  ];
  const current = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="...button styling...">
        {/* Globe icon */}
        <span>{current.label}</span>
        {/* Dropdown arrow */}
      </button>
      {open && (
        <div className="...dropdown menu styling...">
          {languages.map(lang => (
            <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginForm;

