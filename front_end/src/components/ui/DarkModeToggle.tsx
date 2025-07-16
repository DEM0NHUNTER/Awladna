// src/components/common/DarkModeToggle.tsx

import React, { useState, useEffect } from "react";

/**
 * DarkModeToggle component toggles the website theme between light and dark modes.
 * It reads the saved preference from localStorage and applies system preference by default.
 * Toggles the `dark` class on the root <html> element accordingly.
 */
const DarkModeToggle: React.FC = () => {
  // State to track whether dark mode is enabled
  const [isDark, setIsDark] = useState(() => {
    // On initial load, check localStorage for user preference
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "enabled";
  });

  // Effect to add or remove the "dark" class on <html> and save preference on change
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <>
          <span>Light Mode</span>
          {/* Sun icon for light mode */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </>
      ) : (
        <>
          <span>Dark Mode</span>
          {/* Moon icon for dark mode */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;
