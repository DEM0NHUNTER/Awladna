// src/pages/Chat.tsx

import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "../context/ChatContext";
import { useChatMessages } from "../hooks/useChatMessages";
import MessageInput from "../components/chat/MessageInput";
import toast from "react-hot-toast";

/**
 * Chat Page Component
 * - Displays chat conversation between user and AI.
 * - Allows sending messages and shows AI responses.
 */
const Chat: React.FC = () => {
  const { currentChatId, createNewChat } = useChatContext();  // Chat session management from context

  const {
    messages,             // Array of chat messages
    isLoading,            // Loading state (not directly used here)
    addUserMessage,       // Add user's message to state
    addAIMessage          // Add AI's response to state
  } = useChatMessages();  // Custom hook managing chat logic

  const [input, setInput] = useState("");          // Current input value
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state
  const inputRef = useRef<HTMLInputElement>(null); // Ref for focusing input automatically

  /**
   * Ensure a chat session exists and focus input when chatId changes.
   */
  useEffect(() => {
    if (!currentChatId) {
      createNewChat();    // Start a new chat session if none exists
    }
    inputRef.current?.focus();   // Focus on input field when ready
  }, [currentChatId]);

  /**
   * Handles sending the user's message and triggering AI response.
   */
  const sendMessage = async () => {
    console.log('sendMessage triggered');
    const text = input.trim();
    if (!text) return;

    // Construct and add user's message
    const userMsg = {
      id: Date.now().toString(),
      text,
      fromChild: true,              // true = user message, false = AI message
      timestamp: new Date().toISOString(),
    };
    addUserMessage(userMsg);

    // Reset input and show typing indicator
    setInput("");
    setIsTyping(true);

    try {
      await addAIMessage(text);     // Fetch AI response and add it
    } catch {
      toast.error("AI response failed.");  // Show error if AI call fails
    } finally {
      setIsTyping(false);           // Hide typing indicator
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Messages Display Area */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-lg p-3 rounded-xl ${
              msg.fromChild ? "bg-blue-100 ml-auto" : "bg-gray-100"
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && <div className="text-gray-500">Typing...</div>}
      </div>

      {/* Message Input Area */}
      <div className="border-t p-2">
        <MessageInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isTyping={isTyping}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};

export default Chat;
