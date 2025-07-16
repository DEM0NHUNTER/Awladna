// src/main.tsx

// Core React and ReactDOM imports
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Global styles and i18n (localization)
import "./index.css";
import "./i18n";

// React Query setup for API state management
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { applyTheme, getInitialTheme } from "./utils/theme";
import { Toaster } from "react-hot-toast";

// ---- Theme Initialization ----
// Load user theme preference from localStorage or fallback to system preference
applyTheme(getInitialTheme());

// ---- Service Worker Registration ----
// Enables offline features, caching, TTS (text-to-speech), etc.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}

// ---- React Query Client Setup ----
const queryClient = new QueryClient();

// ---- React App Rendering ----
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Provide React Query globally */}
    <QueryClientProvider client={queryClient}>

      {/* React Router for navigation */}
      <BrowserRouter>

        {/* Toast notifications (top-right corner) */}
        <Toaster position="top-right" />

        {/* Main App component */}
        <App />

      </BrowserRouter>

      {/* React Query debugging tool (dev-only usage recommended) */}
      <ReactQueryDevtools initialIsOpen={false} />

    </QueryClientProvider>
  </React.StrictMode>
);
