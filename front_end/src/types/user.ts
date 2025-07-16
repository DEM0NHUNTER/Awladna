// src/types/user.ts

/**
 * Represents a registered user in the Awladna application.
 */
export interface User {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  role: string; // Matches UserRole enum in backend
  is_verified: boolean;
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
}