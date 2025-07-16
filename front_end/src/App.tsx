// src/App.tsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

// Error Boundary to catch UI rendering errors
import ErrorBoundary from "./components/ErrorBoundary";

// Shared layout that wraps protected pages
import AppShell from "./layouts/AppShell";

// Guards protected routes (checks authentication)
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";

const App: React.FC = () => {
  return (
    // Global authentication state provider
    <AuthProvider>

      {/* Global chat state provider */}
      <ChatProvider>

        {/* ErrorBoundary catches rendering errors in child components */}
        <ErrorBoundary>

          {/* React Router: Manage app routing */}
          <Routes>

            {/* Public routes (accessible without login) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes (require authentication) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>   {/* Guard: Redirects to login if unauthenticated */}
                  <AppShell />     {/* Shared UI layout for authenticated pages */}
                </ProtectedRoute>
              }
            >
              {/* Routes rendered inside AppShell after authentication */}
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="feedback" element={<Feedback />} />

              {/* Catch-all route: redirects to homepage */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

          </Routes>
        </ErrorBoundary>

      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
