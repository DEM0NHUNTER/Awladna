// src/layouts/AppShell.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

/**
 * AppShell component provides the main layout structure of the app.
 *
 * - Includes a persistent Navbar at the top.
 * - Uses React Router's Outlet to render nested route components inside the main content area.
 * - Sets up a flex column layout to ensure footer or other content can be added easily.
 */
const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar displayed at the top on every page */}
      <Navbar />
      {/* Main content area where nested routes render */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
