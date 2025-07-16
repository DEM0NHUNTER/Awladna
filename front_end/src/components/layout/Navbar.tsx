// src/components/layout/Navbar.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

/**
 * ✅ SVG Icon Components:
 * - HomeIcon: House shape
 * - ChatIcon: Speech bubble with dots
 * - UserIcon: User silhouette
 * - StarIcon: Star shape, can be filled or outlined
 * - HeartLogo: Gradient heart logo for branding
 */

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 12L12 5l9 7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12v7a2 2 0 002 2h2a2 2 0 002-2v-3h2v3a2 2 0 002 2h2a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="10" r="1"/>
    <circle cx="13" cy="10" r="1"/>
    <circle cx="17" cy="10" r="1"/>
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
  </svg>
);

const StarIcon = ({ filled, className }: { filled?: boolean; className?: string }) => (
  <svg className={className} width="20" height="20" fill={filled ? '#2563eb' : 'none'} stroke={filled ? '#2563eb' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const HeartLogo = () => (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-400 to-purple-500 mr-2">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  </span>
);

/**
 * ✅ Navbar Component:
 * - Responsive top navigation bar.
 * - Includes logo, nav links, language switcher, and user dropdown.
 * - Highlights active nav link based on route.
 * - Handles RTL layout for Arabic language.
 * - Manages dropdown open/close on outside click.
 * - Supports logout functionality.
 */
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Set document direction (ltr or rtl) based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Navigation links with translated labels and icons
  const navLinks = [
    { name: t('dashboard'), path: '/dashboard', icon: HomeIcon },
    { name: t('chat'), path: '/chat', icon: ChatIcon },
    { name: t('profile'), path: '/profile', icon: UserIcon },
    { name: t('feedback'), path: '/feedback', icon: StarIcon },
  ];

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Left: Logo */}
        <div className="flex-1 flex items-center">
          <Link to="/dashboard" className="flex items-center text-xl font-bold text-indigo-700">
            <HeartLogo />
            <span>{t('awladna')}</span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-10">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 text-base font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {link.name === t('feedback') ? (
                    <Icon filled={isActive} />
                  ) : (
                    <Icon />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: User Info & Language Switcher */}
        <div className="flex-1 flex justify-end items-center gap-8">
          {/* Language Switcher with margin adjusted for RTL */}
          <div className={isRTL ? 'mr-8' : 'ml-8'}>
            <LanguageSwitcher />
          </div>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-gray-200 mx-2" />

          {/* User Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center space-x-3 focus:outline-none group bg-gray-100 rounded-xl px-3 py-2 transition shadow-sm hover:shadow-lg hover:bg-gray-200"
                onClick={() => setDropdownOpen(open => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg border border-gray-300">
                    {user.name ? user.name.charAt(0).toUpperCase() : ''}
                  </div>
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition">
                    {user.name || user.email}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-indigo-700 transition">
                    {user.email}
                  </span>
                </div>
                <svg className="w-5 h-5 ml-2 text-gray-400 group-hover:text-indigo-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fadeIn">
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition"
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * ✅ LanguageSwitcher Component:
 * - Allows user to toggle site language between English and Arabic.
 * - Shows current language.
 * - Displays dropdown menu for language selection.
 * - Adjusts RTL/LTR layout dynamically.
 */
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  // Supported languages
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' }
  ];

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 transition text-gray-700 font-semibold focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
        </svg>
        <span>{current.label}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 transition ${i18n.language === lang.code ? 'bg-blue-100 font-bold' : ''}`}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setOpen(false);
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
