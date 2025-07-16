// src/utils/theme.ts

/**
 * Determines the initial theme for the application.
 * Checks:
 *  1. If user preference exists in localStorage, use it.
 *  2. Otherwise, use system preference (via prefers-color-scheme).
 * @returns "dark" or "light"
 */
export const getInitialTheme = (): "dark" | "light" => {
  const saved = localStorage.getItem("theme");

  if (saved === "dark" || saved === "light") {
    return saved;  // User previously set preference
  }

  // Check system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Applies the specified theme to the document.
 * Adds or removes the "dark" class on the <html> tag.
 * Persists the user's choice in localStorage.
 * @param theme - Either "dark" or "light"
 */
export const applyTheme = (theme: "dark" | "light") => {
  const root = document.documentElement;

  // Toggle "dark" class based on the theme
  root.classList.toggle("dark", theme === "dark");

  // Save theme preference
  localStorage.setItem("theme", theme);
};
