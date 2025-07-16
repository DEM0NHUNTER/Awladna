// src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useChatContext } from '../../context/ChatContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  childId: string;
  collapsed?: boolean;
  onClose?: () => void;
  showHistory?: boolean;
  setShowHistory?: (open: boolean) => void;
}

/**
 * HeartLogo SVG component:
 * - Purple rounded square background with a white heart shape
 * - Used as branding/logo in the sidebar header
 */
const HeartLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="8" fill="#A78BFA"/>
    <path d="M12 18.25C11.7 18.25 11.42 18.18 11.18 18.04C8.09 16.19 5.75 13.97 5.75 11.6C5.75 9.91 7.09 8.5 8.75 8.5C9.66 8.5 10.53 8.97 11.04 9.74C11.28 10.09 11.72 10.09 11.96 9.74C12.47 8.97 13.34 8.5 14.25 8.5C15.91 8.5 17.25 9.91 17.25 11.6C17.25 13.97 14.91 16.19 11.82 18.04C11.58 18.18 11.3 18.25 12 18.25Z" fill="white"/>
  </svg>
);

/**
 * Sidebar component:
 * - Vertical sidebar for navigation and quick actions
 * - Supports collapsed state (narrow width)
 * - Handles RTL layout for Arabic language
 * - Displays child profile link, chat, and dashboard links
 * - Includes quick action buttons: New Chat, Chat History
 * - Shows modal with chat history when triggered
 * - Supports closing on mobile via optional onClose handler
 */
const Sidebar: React.FC<SidebarProps> = ({
  childId,
  collapsed = false,
  onClose,
  showHistory,
  setShowHistory,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createNewChat, chats, setCurrentChatId } = useChatContext();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Check if the given path matches the current route path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handler for starting a new chat:
  // creates chat, sets it as current, closes sidebar if applicable
  const handleNewChat = () => {
    const newId = createNewChat();
    setCurrentChatId(newId);
    if (onClose) onClose();
  };

  // Open chat history modal and optionally close sidebar
  const handleOpenHistory = () => {
    if (setShowHistory) setShowHistory(true);
    if (onClose) onClose();
  };

  // Open existing chat by setting current chat id, closes history modal
  const handleOpenChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (setShowHistory) setShowHistory(false);
  };

  return (
    <div
      className={`h-full flex flex-col ${collapsed ? 'w-20' : 'w-80'} transition-all duration-300 bg-gradient-to-b from-[#000080] to-[#000080]/90 shadow-xl fixed top-0 ${
        isRTL ? 'right-0' : 'left-0'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mobile Close Button */}
      {onClose && (
        <button
          className={`md:hidden absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 bg-white/20 rounded-full p-2 text-white hover:bg-white/30`}
          onClick={onClose}
          aria-label={t('closeSidebar', 'Close Sidebar')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Logo / Brand Section */}
      <div className="p-6 border-b border-[#000080]/20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 flex items-center justify-center mb-2">
          <HeartLogo />
        </div>
        {!collapsed && (
          <div className="text-center">
            <h1 className="text-white font-bold text-xl">{t('awladna')}</h1>
            <p className="text-white text-sm">{t('aiAssistant', 'AI Assistant')}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      {!collapsed && (
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {t('navigation', 'Navigation')}
            </h3>

            {/* Child Profile Link */}
            <Link
              to={`/child-profiles/${childId}`}
              className={`flex items-center ${
                isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
              } ${isRTL ? 'pr-4' : 'pl-4'} py-3 rounded-xl transition-all duration-200 group text-base font-medium ${
                isActive(`/child-profiles/${childId}`)
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{t('profile')}</span>
            </Link>

            {/* Chat Link */}
            <Link
              to="/chat"
              className={`flex items-center ${
                isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
              } ${isRTL ? 'pr-4' : 'pl-4'} py-3 rounded-xl transition-all duration-200 group text-base font-medium ${
                isActive('/chat')
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{t('chat')}</span>
            </Link>

            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              className={`flex items-center ${
                isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
              } ${isRTL ? 'pr-4' : 'pl-4'} py-3 rounded-xl transition-all duration-200 group text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
              <span>{t('dashboard')}</span>
            </Link>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              {t('quickActions', 'Quick Actions')}
            </h3>
            <div className="space-y-2">
              {/* New Chat Button */}
              <button
                className={`w-full flex items-center ${
                  isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
                } ${isRTL ? 'pr-4' : 'pl-4'} py-3 rounded-xl text-white hover:bg-white/10 hover:text-white transition-all duration-200 group text-base font-medium`}
                onClick={handleNewChat}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>{t('newChat', 'New Chat')}</span>
              </button>

              {/* Chat History Button */}
              <button
                className={`w-full flex items-center ${
                  isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'
                } ${isRTL ? 'pr-4' : 'pl-4'} py-3 rounded-xl text-white hover:bg-white/10 hover:text-white transition-all duration-200 group text-base font-medium`}
                onClick={handleOpenHistory}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{t('chatHistory', 'Chat History')}</span>
              </button>
            </div>

            {/* Chat History Modal */}
            {showHistory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay with blur and dim */}
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-[10px]"
                  style={{ zIndex: 51 }}
                />
                {/* Modal container */}
                <div
                  className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fadeIn z-60"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl font-bold"
                    onClick={() => setShowHistory && setShowHistory(false)}
                    aria-label={t('close', 'Close')}
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-indigo-700">{t('chatHistory', 'Chat History')}</h2>

                  {/* Chat list or empty state */}
                  {chats?.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      {t('noChatsYet', 'No chats yet. Start a new chat!')}
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {chats.map(chat => (
                        <li key={chat.id}>
                          <button
                            className="w-full flex flex-col items-start p-4 rounded-xl bg-transparent hover:bg-indigo-100 transition text-left shadow-none focus:outline-none"
                            onClick={() => handleOpenChat(chat.id)}
                          >
                            <span className="font-semibold text-indigo-800 truncate w-full">
                              {chat.topic || t('untitledChat', 'Untitled Chat')}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(chat.createdAt).toLocaleString(i18n.language)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
