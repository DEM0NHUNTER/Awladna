// src/components/common/DarkModeToggle.tsx

import React, { useEffect, useState } from "react";

/**
 * ✅ DarkModeToggle Component:
 * - Allows user to toggle between dark and light themes.
 * - Saves preference to localStorage.
 * - Uses prefers-color-scheme as default if no preference saved.
 */
const DarkModeToggle: React.FC = () => {

  // State: true if dark mode enabled
  const [isDark, setIsDark] = useState(() => {
    // Load theme from localStorage (if available)
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";

    // Fallback: check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  /**
   * useEffect:
   * - Runs whenever isDark state changes.
   * - Adds/removes the "dark" class from document root.
   * - Persists theme preference to localStorage.
   */
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}               // Toggle theme on click
      className="text-gray-600 dark:text-gray-200 hover:text-blue-500 transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? "🌙" : "☀️"}                                 {/* Icon indicates current mode */}
    </button>
  );
};

export default DarkModeToggle;
