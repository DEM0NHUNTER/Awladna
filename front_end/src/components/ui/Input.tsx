// src/components/ui/Input.tsx

import React from "react";
import clsx from "clsx";

/**
 * InputProps extends all native HTML input attributes.
 * Includes optional className for custom styling.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/**
 * Input - A reusable styled input component.
 * Uses React.forwardRef to pass ref to the underlying input element.
 * Applies base Tailwind CSS classes for consistent styling:
 * - Full width, padding, border, rounded corners
 * - Focus ring with indigo color and no border outline
 * - Disabled state styling with reduced opacity and cursor change
 * - Small text size
 * Merges any additional classes passed via className prop.
 * Spreads all other native input props like type, placeholder, etc.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
