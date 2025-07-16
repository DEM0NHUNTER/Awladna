// src/components/chat/ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory } from '../../services/api';

/**
 * ✅ ChatInterface Component
 * - Displays chat messages between user and AI.
 * - Periodically polls backend for updated history.
 * - Handles message sending.
 * - Linked to specific child profile via childId.
 */
const ChatInterface: React.FC<{ childId: number }> = ({ childId }) => {

  // State management
  const [message, setMessage] = useState('');        // Message input
  const [history, setHistory] = useState<any[]>([]); // Chat message history
  const [loading, setLoading] = useState(false);     // Loading state for sending
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to latest message (optional)

  /**
   * Fetch chat history from backend
   * Retrieves last 10 messages for current childId.
   */
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const data = await getChatHistory(token!, childId);
      setHistory(data.slice(-10));  // Keep only last 10 messages
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  /**
   * On component mount OR when childId changes:
   * - Fetch chat history
   * - Set up polling (every 3 seconds)
   */
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);  // Auto-refresh chat

    return () => clearInterval(interval);              // Cleanup on unmount
  }, [childId]);

  /**
   * Handle message form submission:
   * - Send message to backend
   * - Append user + bot response to chat history
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;       // Prevent empty messages

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await sendMessage(token!, message, childId);

      // Update chat history with new user message and AI response
      setHistory([...history, { user: message, bot: response.response }]);
      setMessage('');                  // Clear input after sending

    } catch (error) {
      // Append error response if backend fails
      setHistory([...history, { user: message, bot: "Error: Could not get response" }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Component rendering:
   * - Displays chat bubbles
   * - Form for message input and sending
   */
  return (
    <div className="flex flex-col h-full">

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {history.map((msg, index) => (
          <div key={index} className="space-y-2">
            <div className="bg-blue-100 p-2 rounded">{msg.user}</div>
            <div className="bg-gray-100 p-2 rounded">{msg.bot}</div>
          </div>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border rounded focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

    </div>
  );
};

export default ChatInterface;
