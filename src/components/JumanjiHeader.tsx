import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface JumanjiHeaderProps {
  user: User;
  onLogout: () => void;
}

const JumanjiHeader: React.FC<JumanjiHeaderProps> = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage and system preference on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to HTML element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'owner' ? 'Owner' : 'Game Master';
  };

  return (
    <header className="bg-light-100 dark:bg-void-900/95 backdrop-blur-md border-b-2 border-void-300 dark:border-neon-bright shadow-2xl transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-bright via-gold-neon to-gold-500 rounded-full flex items-center justify-center shadow-gold-lg animate-pulse-slow">
              <span className="text-3xl font-bold text-void-1000">🎲</span>
            </div>
            <div>
              <h1 className="text-4xl font-jumanji font-black text-gold-bright animate-glow">
                JUMANJI
              </h1>
              <p className="text-void-800 dark:text-neon-bright text-sm font-arcade font-bold transition-colors duration-300">
                Board Game Shop Management
              </p>
            </div>
          </div>

          {/* Navigation and Controls */}
          <div className="flex items-center space-x-6">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-bright to-neon-glow rounded-full flex items-center justify-center">
                <span className="text-sm font-arcade font-black text-void-1000">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-arcade font-bold text-gold-bright">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-void-700 dark:text-neon-bright/80 font-arcade capitalize transition-colors duration-300">
                  {getRoleDisplayName(user?.role || 'Guest')}
                </p>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-light-200 dark:bg-void-800 hover:bg-light-300 dark:hover:bg-void-700 text-gold-bright rounded-lg transition-all duration-300 border-2 border-transparent hover:border-gold-bright"
              title="Toggle dark mode"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white text-sm font-arcade font-bold rounded-lg transition-all duration-300 flex items-center space-x-2 border-2 border-danger-600 hover:border-danger-500 shadow-lg hover:shadow-xl"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default JumanjiHeader;
