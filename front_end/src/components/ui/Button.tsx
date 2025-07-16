// src/components/ui/Button.tsx

import React from "react";
import { cn } from "@/lib/utils"; // Utility function for conditionally joining classNames

/**
 * ButtonProps interface extends standard button HTML attributes,
 * adding optional `variant` and `size` props for styling variations.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"; // Visual style variant
  size?: "sm" | "md" | "lg";                         // Size variant
}

/**
 * Base styles applied to all buttons:
 * - Inline flexbox for centering content horizontally and vertically
 * - Medium font weight, rounded corners, smooth color transitions
 * - Focus outline and ring for accessibility
 */
const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

/**
 * Variant styles define the visual appearance of buttons.
 * Keys correspond to the `variant` prop.
 */
const variants: Record<string, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700",           // Solid blue background with white text
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-100", // Gray border with text and subtle hover background
  ghost: "text-gray-700 hover:bg-gray-100",                      // No border or background by default, subtle hover
  link: "text-blue-600 underline hover:text-blue-800",           // Styled as a link with underline and blue text
};

/**
 * Size styles define padding and font size.
 * Keys correspond to the `size` prop.
 */
const sizes: Record<string, string> = {
  sm: "px-3 py-1 text-sm",   // Small button with smaller padding and text
  md: "px-4 py-2 text-base", // Medium/default button size
  lg: "px-6 py-3 text-lg",   // Large button with bigger padding and text
};

/**
 * Button component:
 * - Forwards ref to underlying button element for imperative access
 * - Combines base styles with selected variant and size styles
 * - Accepts additional props such as onClick, disabled, etc.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    // Combine all relevant class names using the cn utility
    const style = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    );

    return (
      <button ref={ref} className={style} {...props} />
    );
  }
);

Button.displayName = "Button";
