// src/components/auth/LogoutButton.tsx

import React from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

// ✅ LogoutButton component handles logging out the user and redirecting them to home page.
// - Calls logout() from AuthContext
// - Navigates to "/" after logout

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();        // Get logout function from AuthContext
  const navigate = useNavigate();      // Navigation hook from react-router

  const handleLogout = async () => {
    await logout();                    // Clear user session and tokens
    navigate("/");                     // Redirect user to homepage after logout
  };

  return (
    <button
      onClick={handleLogout}           // Attach logout handler
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
    >
      Logout
    </button>
  );
};

export default LogoutButton;

