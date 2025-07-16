// src/components/ui/Label.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * LabelProps extends all native HTML label attributes.
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Label - A reusable styled label component.
 * Uses React.forwardRef to forward ref to the label element.
 * Applies default Tailwind CSS classes:
 * - block display for layout consistency
 * - small font size with medium weight
 * - gray text color for accessibility and visual clarity
 * Accepts additional class names via className prop, merged with cn utility.
 * Renders any children inside the label.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-gray-700", className)}
      {...props}
    >
      {children}
    </label>
  )
);

Label.displayName = "Label";
