// src/components/ErrorBoundary.tsx

import React, { Component } from "react";

// ErrorBoundary component catches JavaScript errors in any child component tree,
// logs those errors, and displays a fallback UI instead of the crashed component tree.

class ErrorBoundary extends Component<
  { children: React.ReactNode },          // Props type: expects child components to render
  { hasError: boolean }                   // State type: tracks if an error occurred
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    // Initialize error state
    this.state = { hasError: false };
  }

  // This lifecycle method is called after an error is thrown in a child component.
  // It updates the state to display fallback UI.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // This method logs error details. It does not affect rendering.
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("🔥 ErrorBoundary caught an error:", error);
    console.error("🧱 Component Stack:", info.componentStack);
  }

  // Render fallback UI if an error occurred, otherwise render children normally
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-10 text-red-600">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="mt-2 text-sm">Please refresh the page or contact support.</p>
        </div>
      );
    }

    return this.props.children;  // Render children components normally if no error
  }
}

export default ErrorBoundary;
