// src/components/chat/ImageUploader.tsx

import React, { useState } from "react";

/**
 * Props expected by ImageUploader component:
 * - onUpload: Callback function to handle uploaded file
 */
interface Props {
  onUpload: (file: File) => void;
}

/**
 * ✅ ImageUploader Component:
 * - Allows user to select and preview an image.
 * - Passes uploaded file to parent via onUpload().
 */
const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null); // Holds preview image URL

  /**
   * Handles file selection:
   * - Creates preview URL.
   * - Calls parent-provided onUpload() with selected file.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));  // Display selected image preview
      onUpload(file);                         // Notify parent component
    }
  };

  return (
    <div className="space-y-2">
      {/* Image preview block */}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded border"
        />
      )}

      {/* File input for image selection */}
      <input
        type="file"
        accept="image/*"               // Limit input to image files only
        onChange={handleFileChange}    // Handle file selection
        className="block w-full text-sm text-gray-600"
      />
    </div>
  );
};

export default ImageUploader;
