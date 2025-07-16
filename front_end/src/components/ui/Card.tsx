// src/components/ui/Card.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card component - container with padding, rounded corners, border, shadow, and white background.
 * Uses React.forwardRef to forward ref to the underlying div element.
 * Accepts standard HTML div attributes and an optional className for custom styling.
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl border bg-white p-6 shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardHeader component - container for the card header content.
 * Adds bottom margin by default to separate from the content.
 * Forwards ref to div.
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle component - styled heading element for card titles.
 * Uses an h3 element with larger font size, semibold weight, and tight line height.
 * Forwards ref to h3.
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardContent component - container for the main content inside the card.
 * Uses smaller text size and muted gray color for readability.
 * Forwards ref to div.
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-gray-600", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CardFooter component - container for footer content inside the card.
 * Adds top margin to separate it from content above.
 * Forwards ref to div.
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
