import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';
import FileUpload from '../components/FileUpload';
import LoanSummaryCard from '../components/LoanSummaryCard';
import ThemeToggle from '../components/ThemeToggle';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import { FaPaperPlane, FaHome, FaRedo, FaPaperclip } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, signOut } = useAuth();
  const { messages, sendMessage, user, currentStage, loanDetails, isLoading, resetChat, applicationId, applicationMongoId } = useChatContext();
  const [inputText, setInputText] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after message sent
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Handle sending text message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    sendMessage(`Uploaded: ${file.name}`, file);
    setShowFileUpload(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new conversation?')) {
      resetChat();
    }
  };

  // Stage configuration with modern colors
  const stageConfig = {
    sales: { 
      name: 'Consultation', 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'Getting to know you',
      icon: '💬',
      progress: 25
    },
    verification: { 
      name: 'Verification', 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'Verifying documents',
      icon: '📄',
      progress: 50
    },
    underwriting: { 
      name: 'Processing', 
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      description: 'Analyzing application',
      icon: '⚙️',
      progress: 75
    },
    sanction: { 
      name: 'Final Review', 
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Almost there!',
      icon: '✨',
      progress: 90
    },
    completed: { 
      name: 'Approved', 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      textColor: 'text-green-600 dark:text-green-400',
      description: 'Congratulations!',
      icon: '🎉',
      progress: 100
    },
  };

  const currentStageInfo = stageConfig[currentStage] || stageConfig.sales;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Modern Header - Matching Home Page */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 shadow-sm"
      >
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-tata-blue to-tata-lightBlue rounded-lg flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">C</span>
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-tata-blue dark:text-white">
                CrediFlow
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Loan Approval Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-tata-blue dark:text-tata-gold font-medium text-sm">
                  {authUser?.fullName?.split(' ')[0]}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={signOut}
                  className="px-3 sm:px-4 py-2 text-tata-blue dark:text-tata-gold border border-tata-blue dark:border-tata-gold rounded-lg hover:bg-tata-blue hover:text-white dark:hover:bg-tata-gold dark:hover:text-tata-darkGray transition-all font-medium text-sm"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignInModalOpen(true)}
                  className="hidden sm:block px-4 py-2 text-tata-blue dark:text-tata-gold border border-tata-blue dark:border-tata-gold rounded-lg hover:bg-tata-blue hover:text-white dark:hover:bg-tata-gold dark:hover:text-tata-darkGray transition-all font-medium"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-tata-blue to-tata-lightBlue hover:from-tata-lightBlue hover:to-tata-blue text-white rounded-lg transition-all font-medium text-sm sm:text-base"
                >
                  Sign Up
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <FaHome className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Status Bar */}
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`m-3 sm:m-4 p-3 sm:p-4 rounded-xl ${currentStageInfo.bgColor} border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">{currentStageInfo.icon}</span>
                <div>
                  <p className={`font-semibold text-sm sm:text-base ${currentStageInfo.textColor}`}>{currentStageInfo.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{currentStageInfo.description}</p>
                </div>
              </div>
              {applicationId && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Application ID</p>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-tata-blue dark:text-tata-gold">{applicationId}</p>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                <span>Progress</span>
                <span className="font-semibold">{currentStageInfo.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStageInfo.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-tata-blue to-tata-lightBlue rounded-full relative"
                >
                  <motion.div
                    animate={{ x: ['0%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-4 pb-4 space-y-3 scroll-smooth"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(203 213 225) transparent'
            }}
          >
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MessageBubble 
                    message={message} 
                    onOptionClick={(value) => sendMessage(value)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 px-4"
              >
                <div className="flex space-x-1.5">
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-tata-blue rounded-full"
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-tata-lightBlue rounded-full"
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-tata-gold rounded-full"
                  />
                </div>
                <span className="text-sm">CrediFlow is typing...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 bg-white dark:bg-gray-800"
          >
            <AnimatePresence>
              {showFileUpload && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    onCancel={() => setShowFileUpload(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className={`p-2.5 sm:p-3 rounded-lg transition-all ${
                  showFileUpload 
                    ? 'bg-tata-blue text-white' 
                    : 'text-gray-500 hover:text-tata-blue dark:text-gray-400 dark:hover:text-tata-gold hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Attach file"
              >
                <FaPaperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tata-blue dark:focus:ring-tata-gold focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-tata-blue to-tata-lightBlue hover:from-tata-lightBlue hover:to-tata-blue disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none font-medium"
              >
                <FaPaperPlane className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-pulse' : ''}`} />
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden xl:block w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800"
        >
          {/* User Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Your Profile</p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-tata-blue to-tata-lightBlue rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{user.id.slice(-8)}</p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Journey Timeline</p>
            <div className="space-y-3">
              {Object.entries(stageConfig).map(([key, stage], index) => {
                const stageKeys = Object.keys(stageConfig);
                const currentIndex = stageKeys.indexOf(currentStage);
                const thisIndex = stageKeys.indexOf(key);
                const isCompleted = thisIndex < currentIndex;
                const isCurrent = key === currentStage;
                
                return (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 group"
                  >
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                      isCompleted ? 'bg-green-500 dark:bg-green-600 text-white scale-110' :
                      isCurrent ? 'bg-gradient-to-r from-tata-blue to-tata-lightBlue text-white shadow-lg' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : stage.icon}
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-tata-blue opacity-20"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-all ${
                        isCurrent ? 'text-tata-blue dark:text-tata-gold' : 
                        isCompleted ? 'text-gray-700 dark:text-gray-300' :
                        'text-gray-400 dark:text-gray-500'
                      }`}>
                        {stage.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Loan Summary */}
          {loanDetails.status === 'approved' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <LoanSummaryCard loanDetails={loanDetails} applicationId={applicationMongoId} />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Auth Modals */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpModalOpen(false);
          setIsSignInModalOpen(true);
        }}
      />
    </div>
  );
};

export default Chat;
