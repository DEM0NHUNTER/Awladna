// src/api/axiosInstance.ts
import axios from "axios";

// Create a pre-configured Axios instance for API calls
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Use environment variable for API base URL
  headers: {
    "Content-Type": "application/json" // Default content type for requests
  },
  withCredentials: true // Include cookies for cross-origin requests (if applicable)
});

// ✅ Interceptor: Attach Bearer token to all requests EXCEPT public ones
apiClient.interceptors.request.use((config) => {
  // Define public endpoints where authentication is not required
  const publicRoutes = ["/auth/register", "/auth/login", "/auth/verify-email"];
  const isPublic = publicRoutes.some(route => config.url?.includes(route));

  if (!isPublic) {
    // Retrieve access token from localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      // Attach token as Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
