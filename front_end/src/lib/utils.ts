// src/lib/utils.ts

/**
 * Utility to conditionally join class names together.
 * Filters out falsy values like null, undefined, or false.
 * @param classes - Array of class names or falsy values.
 * @returns A single string with all truthy class names joined by space.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Capitalizes the first letter of a string.
 * @param str - Input string.
 * @returns String with first letter capitalized.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a date to a readable string format (e.g., "Jul 3, 2025").
 * Accepts a string or Date object.
 * @param date - Date string or Date object.
 * @returns Formatted date string in "MMM D, YYYY" format.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Sleep helper – returns a promise that resolves after specified milliseconds.
 * Useful to pause execution inside async functions.
 * @param ms - Milliseconds to sleep.
 * @returns Promise resolved after ms milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function – returns a debounced version of the provided function.
 * The debounced function delays invoking `func` until after `delay` milliseconds
 * have elapsed since the last time the debounced function was called.
 * @param func - Function to debounce.
 * @param delay - Delay in milliseconds (default 300).
 * @returns Debounced function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
