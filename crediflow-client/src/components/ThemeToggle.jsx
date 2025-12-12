import React, { useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-16 h-8 rounded-full bg-gradient-to-r from-primary-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md transition-all duration-500 ease-in-out transform ${
          theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
        } ${isAnimating ? 'scale-110' : 'scale-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {theme === 'light' ? (
            <FaSun className="w-4 h-4 text-yellow-500 animate-spin-slow" />
          ) : (
            <FaMoon className="w-4 h-4 text-indigo-400" />
          )}
        </div>
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <FaSun className={`w-3 h-3 text-yellow-200 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} />
        <FaMoon className={`w-3 h-3 text-indigo-200 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
