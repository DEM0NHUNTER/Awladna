export type ChatRole = "user" | "assistant";

// Reuse the structure from AuthContext
export interface ChildProfile {
  child_id: number;
  name: string;
  age: number;
  gender: "male" | "female" | string;
}

// Message structure
export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string; // ISO 8601
  sentiment?: string;
  recommendations?: string[];
  child?: ChildProfile; // enriched context
}

// Server → Client
export interface ChatResponse {
  response: string;
  timestamp: string;
  sentiment?: string;
  recommendations?: string[];
}

// Client → Server
export interface SendMessageRequest {
  message: string;
  child_id: number;
  context?: string;
}
