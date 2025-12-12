import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message }) => {
  const { sender, text, timestamp, file } = message;
  const isBot = sender === 'bot';

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
            isBot 
              ? 'bg-gradient-to-br from-tata-blue to-tata-lightBlue' 
              : 'bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800'
          }`}
        >
          <span className="text-white text-sm font-semibold">
            {isBot ? '🤖' : '👤'}
          </span>
        </motion.div>

        {/* Message Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <div className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
            isBot 
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm' 
              : 'bg-gradient-to-r from-tata-blue to-tata-lightBlue text-white rounded-br-sm'
          }`}>
            {/* File attachment */}
            {file && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`mb-2 p-2 rounded-lg ${
                  isBot ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white/20'
                }`}
              >
                <p className="text-sm flex items-center space-x-2">
                  <span>�</span>
                  <span className="font-medium truncate">{file.name}</span>
                </p>
                <p className="text-xs mt-0.5 opacity-75">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </motion.div>
            )}

            {/* Message text */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {text}
            </p>
          </div>

          {/* Timestamp */}
          <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 px-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {formatTime(timestamp)}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageBubble;
