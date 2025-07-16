// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import type { User } from "@/types/user";
import type { ChildProfile } from "@/types/chat";

/**
 * AuthContextType defines the shape of the authentication context.
 * - user: currently logged-in user info or null if not authenticated.
 * - token: JWT access token string or null.
 * - loading: indicates if auth status/user data is loading.
 * - children: list of ChildProfile objects associated with the user.
 * - login: function to authenticate and log in a user.
 * - register: function to register a new user.
 * - logout: function to log out the user.
 * - refreshUser: function to refresh user data from backend.
 * - refreshChildren: function to refresh children profiles from backend.
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  children: ChildProfile[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshChildren: () => Promise<void>;
}

// Create React context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component wraps app parts needing auth state.
 * Manages user, token, children profiles, and exposes auth methods.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Initialize token from localStorage if present
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [loading, setLoading] = useState(true);
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([]);
  const navigate = useNavigate();

  /**
   * Fetch current user data from backend and update state.
   * Handles failure by setting user to null.
   */
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch child profiles from backend and update state.
   * Logs error and clears profiles on failure.
   */
  const refreshChildren = async () => {
    try {
      const res = await axiosInstance.get("/auth/child/");
      console.log("Fetched children:", res.data);
      setChildrenProfiles(res.data);
    } catch (err) {
      console.error("Failed to fetch children:", err);
      setChildrenProfiles([]);
    }
  };

  /**
   * Log in user with credentials.
   * Stores JWT token in localStorage and axios headers.
   * Refreshes user and children data on success.
   * Navigates to dashboard.
   * Throws error if login fails.
   */
  const login = async (email: string, password: string) => {
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      const accessToken = res.data.access_token;

      localStorage.setItem("access_token", accessToken);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setToken(accessToken);

      await Promise.all([refreshUser(), refreshChildren()]);
      console.log("Login successful, user:", res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  /**
   * Register a new user with email and password.
   * Throws error if registration fails.
   */
  const register = async (email: string, password: string) => {
    try {
      await axiosInstance.post("/auth/register", { email, password });
    } catch (err) {
      console.error("Registration failed", err);
      throw err;
    }
  };

  /**
   * Log out current user.
   * Calls backend logout endpoint, clears token and user state.
   * Navigates to login page.
   * Ignores logout errors but logs a warning.
   */
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed", err);
    } finally {
      localStorage.removeItem("access_token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
      setChildrenProfiles([]);
      navigate("/login");
    }
  };

  /**
   * On mount, check for stored token and initialize auth state.
   * Sets axios default header if token found.
   * Fetches user and children profiles if token exists.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    const initialize = async () => {
      if (storedToken) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setToken(storedToken);
        await Promise.all([refreshUser(), refreshChildren()]);
      } else {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Provide auth state and methods to child components
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        children: childrenProfiles,
        login,
        register,
        logout,
        refreshUser,
        refreshChildren,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access auth context.
 * Throws error if used outside AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
