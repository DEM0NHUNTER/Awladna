// src/components/common/LoadingSpinner.tsx

import React from "react";

/**
 * ✅ LoadingSpinner Component:
 * - Displays a spinning circle to indicate loading state.
 * - Accepts optional 'size' prop to control spinner size (default 32px).
 */
const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div className="flex justify-center items-center">
    {/* Spinner Circle */}
    <div
      className="animate-spin rounded-full border-t-2 border-b-2 border-blue-600"
      style={{ width: size, height: size }}
    ></div>
  </div>
);

export default LoadingSpinner;
