// src/components/auth/ProtectedRoute.tsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ✅ ProtectedRoute component
// - Guards private routes by checking authentication status
// - Redirects unauthenticated users to /login
// - Shows "Loading..." UI while auth state is being determined

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();         // Get current user and loading status from AuthContext
  const location = useLocation();              // Current route location (used to redirect back after login)

  if (loading) return <div>Loading...</div>;   // Render fallback while checking auth state

  if (!user) {
    // If user not authenticated, redirect to login and preserve the original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user authenticated, render the protected component(s)
  return children;
};

export default ProtectedRoute;
