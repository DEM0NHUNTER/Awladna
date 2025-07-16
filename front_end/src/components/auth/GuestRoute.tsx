// src/components/auth/GuestRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ✅ GuestRoute component ensures that only unauthenticated (guest) users
// can access certain routes (e.g., login, register). If the user is already
// authenticated, they are redirected to the /chat page automatically.

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth(); // Get current user and loading state from auth context

  if (loading)
    return <div>Loading...</div>; // Show loading placeholder while auth state is resolving

  if (user)
    return <Navigate to="/chat" replace />; // Redirect authenticated users to /chat

  // Render child components for guests (unauthenticated users)
  return <>{children}</>;
};

export default GuestRoute;
