// src/context/ChatContext.tsx
import React, { createContext, useContext, useState } from 'react';

/**
 * ChatMessage interface defines the structure of each message in a chat.
 * - id: unique identifier for the message.
 * - text: the message content.
 * - fromChild: boolean indicating if the message is from the child (true) or AI/user (false).
 * - timestamp: ISO string timestamp when the message was sent.
 * - sentiment: optional sentiment label (e.g., "positive", "neutral", "negative").
 * - sentiment_score: optional numeric sentiment score.
 * - suggestions: optional list of suggested replies or actions.
 */
export interface ChatMessage {
  id: string;
  text: string;
  fromChild: boolean;
  timestamp: string;
  sentiment?: string;
  sentiment_score?: number;
  suggestions?: string[];
}

/**
 * Chat interface represents a single chat session.
 * - id: unique identifier for the chat.
 * - messages: array of ChatMessage objects in the conversation.
 */
export interface Chat {
  id: string;
  messages: ChatMessage[];
}

/**
 * ChatContextType defines the data and methods exposed by the chat context.
 * - chats: array of all chat sessions.
 * - currentChatId: id of the currently active chat or null if none selected.
 * - setCurrentChatId: function to change the active chat by id.
 * - addMessageToChat: function to add a new message to a specific chat.
 * - createNewChat: function to create a new chat session and return its id.
 */
interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  createNewChat: () => string;
}

// Create React context with undefined default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * ChatProvider component wraps parts of the app that need chat state.
 * Provides chat list, active chat id, and methods to create chats and add messages.
 */
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  /**
   * Creates a new chat session with a unique id and empty messages.
   * Sets the newly created chat as the current active chat.
   * Returns the new chat id.
   */
  const createNewChat = (): string => {
    const newChat: Chat = {
      id: Date.now().toString(), // Use timestamp as simple unique id
      messages: [],
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  /**
   * Adds a new message to the chat identified by chatId.
   * Updates the chat's messages array immutably.
   */
  const addMessageToChat = (chatId: string, message: ChatMessage) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
      )
    );
  };

  // Provide chat state and methods to context consumers
  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        setCurrentChatId,
        addMessageToChat,
        createNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Custom hook to consume chat context.
 * Throws an error if used outside of ChatProvider.
 */
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within a ChatProvider');
  return context;
};
