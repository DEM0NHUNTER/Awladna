// src/services/api.ts

import axios from 'axios';

/**
 * Axios instance configured for API calls.
 * Automatically uses environment API URL or defaults to localhost.
 * Sends cookies/credentials with requests (for session-based auth).
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

/**
 * Sets or removes the Authorization header for all outgoing requests.
 * Typically used for Bearer token authentication.
 * @param token - JWT token or null to remove the header
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// ===============================
// Auth Endpoints
// ===============================

/**
 * Sends login credentials and receives a token/session.
 * @param email - User email
 * @param password - User password
 * @returns Response data from backend
 */
export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Registers a new user.
 * @param email - User email
 * @param password - User password
 * @returns Response data from backend
 */
export const register = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/register', { email, password });
  return response.data;
};

// ===============================
// Chat Endpoints
// ===============================

/**
 * Sends a chat message to the AI and receives the response.
 * Automatically sets Authorization header.
 * @param token - Bearer token for authentication
 * @param message - Message content from user
 * @param childId - ID of the selected child profile
 * @returns AI response and metadata
 */
export const sendMessage = async (token: string, message: string, childId: number) => {
  setAuthToken(token);
  const response = await apiClient.post('/chat', { message, child_id: childId });
  return response.data;
};

/**
 * Fetches previous chat history for a child profile.
 * @param token - Bearer token
 * @param childId - ID of the child profile
 * @returns Chat message history
 */
export const getChatHistory = async (token: string, childId: number) => {
  setAuthToken(token);
  const response = await apiClient.get(`/chat/history/${childId}`);
  return response.data;
};

// ===============================
// Child Profile Endpoints
// ===============================

/**
 * Fetches all child profiles linked to the current user.
 * @param token - Bearer token
 * @returns Array of child profiles
 */
export const getChildProfiles = async (token: string) => {
  setAuthToken(token);
  const response = await apiClient.get('/child-profiles');
  return response.data;
};

/**
 * Creates a new child profile.
 * @param token - Bearer token
 * @param data - Profile data (name, age, gender, etc.)
 * @returns Created child profile
 */
export const createChildProfile = async (token: string, data: any) => {
  setAuthToken(token);
  const response = await apiClient.post('/child-profiles', data);
  return response.data;
};
