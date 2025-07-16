// src/components/ui/Select.tsx
"use client";

import * as React from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select - Root component wrapping Radix UI Select.
 * Provides context and controls state for select dropdown.
 */
export const Select = RadixSelect.Root;

/**
 * SelectTrigger - The button/control that opens the dropdown.
 * Uses forwardRef for ref forwarding.
 * Applies default Tailwind CSS styles for size, border, focus, disabled states, and layout.
 * Renders the children and a down-chevron icon as dropdown indicator.
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = RadixSelect.Trigger.displayName;

/**
 * SelectValue - Displays the selected value inside the trigger button.
 * Direct re-export from Radix UI.
 */
export const SelectValue = RadixSelect.Value;

/**
 * SelectContent - Dropdown content wrapper.
 * Uses RadixSelect.Portal to render dropdown in portal to avoid overflow/clipping.
 * Styles dropdown panel with shadow, border, rounded corners, and white background.
 * Contains the Viewport which wraps the selectable items.
 */
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-sm shadow-md",
        className
      )}
      {...props}
    >
      <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = RadixSelect.Content.displayName;

/**
 * SelectItem - An individual selectable item inside the dropdown.
 * Uses forwardRef for ref forwarding.
 * Styled with padding, cursor pointer, rounded corners, focus highlight.
 * Displays the item text and a checkmark icon if selected.
 */
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RadixSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-blue-100",
      className
    )}
    {...props}
  >
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    <RadixSelect.ItemIndicator className="absolute right-2 inline-flex items-center">
      <Check className="h-4 w-4 text-blue-600" />
    </RadixSelect.ItemIndicator>
  </RadixSelect.Item>
));
SelectItem.displayName = RadixSelect.Item.displayName;
