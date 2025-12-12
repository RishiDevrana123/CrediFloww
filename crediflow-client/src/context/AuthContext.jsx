import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Sign up function
  const signUp = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data; // response.data because API interceptor returns response.data
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to sign up. Please try again.' 
      };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: loggedInUser } = response.data; // response.data because API interceptor returns response.data
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Update state
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password.' 
      };
    }
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
