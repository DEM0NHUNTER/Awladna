// src/components/layout/Header.tsx

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import LogoutButton from "../auth/LogoutButton";

/**
 * ✅ Header Component:
 * - Displays main site header with navigation links.
 * - Shows different nav items depending on user authentication state.
 * - Includes loading state display.
 * - Provides Dashboard, Profile, Logout links when logged in.
 * - Shows Login and Register links when logged out.
 * - Includes a mock logout button for development/testing purposes.
 */
const Header: React.FC = () => {
  const { user, loading, mockLogout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Site Logo / Title */}
        <Link to="/" className="text-2xl font-semibold text-indigo-600">
          Awladna
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {loading ? (
            // Loading indicator while auth status is being fetched
            <span className="text-gray-500">Loading...</span>
          ) : user ? (
            <>
              {/* Authenticated user links */}
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Profile
              </Link>

              {/* Logout button */}
              <LogoutButton />

              {/* Mock Logout Button for Development */}
              <button
                onClick={mockLogout}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm"
                title="Mock Logout (Development)"
              >
                🚀 Mock Logout
              </button>
            </>
          ) : (
            <>
              {/* Public user links */}
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
