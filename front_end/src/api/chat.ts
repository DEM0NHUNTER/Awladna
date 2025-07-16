// src/api/chat.ts

// Define the base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Input structure expected when sending a chat request to the backend
export interface FetchChatResponseInput {
  user_input: string; // The user's message or question
}

// Expected structure of the AI response returned from backend
export interface AIResponse {
  response: string; // AI-generated reply
  sentiment: string; // Sentiment analysis label (e.g., "positive", "negative")
  sentiment_score: number; // Numerical score representing sentiment strength
  suggested_actions: string[]; // List of AI-suggested actions or advice
}

// Main function to fetch AI chat response from backend API
export async function fetchChatResponse(input: FetchChatResponseInput): Promise<AIResponse> {
  // Retrieve access token from localStorage for authentication
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found'); // Ensure the user is authenticated
  }

  console.log('Attempting fetch to AI backend');

  // Send POST request to backend /auth/chat/respond endpoint
  const res = await fetch(`${API_BASE_URL}/auth/chat/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Attach Bearer token for protected endpoint
    },
    body: JSON.stringify(input), // Send user input as JSON payload
  });

  // Handle API errors gracefully
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI error: ${res.status} ${text}`);
  }

  // Return parsed AIResponse from server
  return res.json();
}
