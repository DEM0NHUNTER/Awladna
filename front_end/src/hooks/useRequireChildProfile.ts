// hooks/useRequireChildProfiles.ts

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

/**
 * Custom hook to ensure that child profiles exist for the authenticated user.
 *
 * - Fetches child profiles from backend endpoint `/auth/child`.
 * - If no profiles exist or an error occurs, redirects user to the profile creation page.
 * - Returns the fetched profiles and loading state.
 *
 * @returns An object containing:
 *  - profiles: Array of child profiles (empty if none)
 *  - loading: Boolean indicating if profiles are currently loading
 */
export const useRequireChildProfiles = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        const res = await axiosInstance.get("/auth/child");
        setProfiles(res.data);

        // If no child profiles exist, redirect to profile creation page
        if (res.data.length === 0) {
          navigate("/profile");
        }
      } catch {
        // On error, also redirect to profile creation page
        navigate("/profile");
      } finally {
        // Loading complete regardless of success or failure
        setLoading(false);
      }
    };

    checkAndFetch();
  }, [navigate]);

  return { profiles, loading };
};
