// src/api/auth.ts

// Import the pre-configured Axios instance
import apiClient from './client';

/**
 * Interface for login request payload.
 */
interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Interface for register request payload.
 */
interface RegisterPayload {
  name: string;     // User's name (currently unused in request)
  email: string;
  password: string;
}

/**
 * Interface for reset password request payload.
 */
interface ResetPasswordPayload {
  token: string;        // Reset token received via email
  newPassword: string;  // New password to set
}

/**
 * Log in the user using email and password.
 * Returns a Promise resolving to the API response.
 */
export const login = async ({ email, password }: LoginPayload) => {
  return apiClient.post('/api/auth/login', { email, password });
};

/**
 * Register a new user.
 * NOTE: Only email and password are sent. 'name' is currently ignored in the request.
 */
export const register = async ({ email, password }: RegisterPayload) => {
  return apiClient.post('/api/auth/register', { email, password });
};

/**
 * Trigger forgot password flow.
 * Sends reset instructions to the provided email if registered.
 */
export const forgotPassword = async (email: string) => {
  return apiClient.post('/api/auth/forgot-password', { email });
};

/**
 * Complete password reset process.
 * Uses the reset token and new password to update user's password.
 */
export const resetPassword = async ({ token, newPassword }: ResetPasswordPayload) => {
  return apiClient.post('/api/auth/reset-password', { token, newPassword });
};

/**
 * Log out the currently authenticated user.
 */
export const logout = async () => {
  return apiClient.post('/api/auth/logout');
};
