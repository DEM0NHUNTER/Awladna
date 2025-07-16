// src/hooks/useChat.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchChatResponse } from "../api/chat";
import { useAuth } from "../context/AuthContext";
import { useChatContext } from "../context/ChatContext";

/**
 * Custom hook to handle chat-related operations.
 * - Fetches the list of children profiles for the authenticated user.
 * - Provides a mutation to send messages to the AI and handle responses.
 */
export const useChat = () => {
  const { token } = useAuth(); // Get auth token from context
  const { addMessageToChat, currentChatId, currentChat } = useChatContext(); // Chat state and methods

  /**
   * Query to fetch children profiles.
   * Runs only if the user is authenticated (token exists).
   * Returns an empty array by default if no data.
   */
  const { data: children = [], ...rest } = useQuery({
    queryKey: ["children", token],
    queryFn: async () => {
      const res = await fetch("/api/auth/child/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch children");
      return res.json();
    },
    enabled: !!token,
  });

  /**
   * Mutation to send a message to the AI backend and receive a response.
   * The payload conditionally includes child information if present.
   * On success, the AI's response message is added to the current chat.
   */
  const aiMutation = useMutation({
    mutationFn: async ({ message, chat }: { message: string; chat: any }) => {
      const payload: any = { user_input: message };
      if (chat?.childId) {
        payload.child_id = chat.childId;
        payload.child_age = chat.childAge;
        payload.child_name = chat.childName;
      }
      return await fetchChatResponse(payload);
    },
    onSuccess: (data, { chat }) => {
      const aiMessage = {
        id: `${Date.now()}_ai`, // unique id for AI message
        text: data.response,
        fromChild: false, // message from AI, not child
        timestamp: new Date().toISOString(),
        sentiment: data.sentiment,
        sentiment_score: data.sentiment_score,
        suggestions: data.suggested_actions,
      };
      addMessageToChat(chat.id, aiMessage);
    },
  });

  // Return fetched children, mutation object, and other query metadata
  return {
    children,
    aiMutation,
    ...rest,
  };
};
