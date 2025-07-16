// src/hooks/useChatMessages.ts
import { useState } from "react";
import { fetchChatResponse } from "../api/chat";
import { useChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";

/**
 * Custom hook to manage chat messages and interaction with AI backend.
 * Maintains local message list and loading state.
 * Provides functions to add user and AI messages to the current chat.
 */
export const useChatMessages = () => {
  const { currentChatId, addMessageToChat } = useChatContext();
  const [messages, setMessages] = useState([]); // Local state for messages in the current chat
  const [isLoading, setIsLoading] = useState(false); // Loading state while awaiting AI response

  /**
   * Adds a user message to the chat context and local messages state.
   * Does nothing if there is no current chat selected.
   * @param msg - the user message object to add
   */
  const addUserMessage = (msg) => {
    if (!currentChatId) return;
    addMessageToChat(currentChatId, msg); // Add message globally in context
    setMessages(prev => [...prev, msg]); // Also update local message list
  };

  /**
   * Sends a user input message to the AI backend and processes the response.
   * Updates loading state, adds AI message to context and local state.
   * Shows an error toast if the request fails.
   * @param input - the user's text input to send to AI
   */
  const addAIMessage = async (input: string) => {
    console.log('Sending message to AI backend:', input);
    setIsLoading(true);
    try {
      const res = await fetchChatResponse({ user_input: input });
      console.log('AI backend responded:', res);

      // Construct AI message object with metadata from backend response
      const aiMsg = {
        id: `${Date.now()}_ai`,
        text: res.response,
        fromChild: false,
        timestamp: new Date().toISOString(),
        sentiment: res.sentiment,
        sentiment_score: res.sentiment_score,
        suggestions: res.suggested_actions,
      };

      if (currentChatId) {
        addMessageToChat(currentChatId, aiMsg);
      }

      setMessages(prev => [...prev, aiMsg]); // Add AI message locally

    } catch (error) {
      console.error('AI fetch failed:', error);
      toast.error("AI response failed."); // Notify user on error
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Return messages, loading state, and message handling functions
  return {
    messages,
    isLoading,
    addUserMessage,
    addAIMessage,
  };
};
