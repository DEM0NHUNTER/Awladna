// src/types/chat.ts

/**
 * Represents a single chat message in the system.
 */

export interface Message {
  id: string;
  text: string;
  fromChild: boolean;
  timestamp: string;
  sentiment?: string;
  sentiment_score?: number;
  suggestions?: string[];
}
