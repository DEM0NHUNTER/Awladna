// src/components/ui/Dialog.tsx
"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog - Wrapper for Radix UI Dialog.Root.
 * Used as the main dialog container controlling open/close state.
 */
export const Dialog = RadixDialog.Root;

/**
 * DialogTrigger - Wrapper for Radix UI Dialog.Trigger.
 * Used to toggle the dialog visibility.
 */
export const DialogTrigger = RadixDialog.Trigger;

/**
 * DialogPortal - Wrapper for Radix UI Dialog.Portal.
 * Renders dialog contents outside the DOM hierarchy for accessibility and layering.
 * Accepts optional className and other props.
 */
export const DialogPortal = ({ className, ...props }: RadixDialog.DialogPortalProps) => (
  <RadixDialog.Portal {...props} />
);
DialogPortal.displayName = RadixDialog.Portal.displayName;

/**
 * DialogOverlay - Semi-transparent dark overlay behind the dialog.
 * Covers entire viewport and applies a blur effect.
 * Forwards ref to RadixDialog.Overlay.
 * Merges base styles with any additional className passed.
 */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
    {...props}
  />
));
DialogOverlay.displayName = RadixDialog.Overlay.displayName;

/**
 * DialogContent - The main dialog panel containing the content.
 * Centered on screen with max width and padding.
 * Includes shadow, rounded corners, and smooth zoom-in animation.
 * Renders children and a close button (X icon) in the top-right corner.
 * Forwards ref to RadixDialog.Content.
 * Wraps content inside DialogPortal and includes DialogOverlay.
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-2xl sm:zoom-in-90",
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute right-4 top-4 text-gray-500 hover:text-gray-900">
        <X className="h-5 w-5" />
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = RadixDialog.Content.displayName;

/**
 * DialogHeader - Container for header section of dialog.
 * Uses flex column layout with vertical spacing.
 * Text is centered on small screens, left-aligned on larger.
 * Accepts custom className and other div props.
 */
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

/**
 * DialogTitle - Styled heading for dialog titles.
 * Uses RadixDialog.Title internally.
 * Applies font size, weight, and tracking.
 * Forwards ref and accepts additional props.
 */
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = RadixDialog.Title.displayName;

/**
 * DialogDescription - Styled description text below the title.
 * Uses RadixDialog.Description internally.
 * Applies smaller font size and muted gray color.
 * Forwards ref and accepts additional props.
 */
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
));
DialogDescription.displayName = RadixDialog.Description.displayName;
