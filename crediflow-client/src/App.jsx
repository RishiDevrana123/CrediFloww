import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import Home from './pages/Home'
import Chat from './pages/Chat'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
              </Routes>
            </div>
          </ChatProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
