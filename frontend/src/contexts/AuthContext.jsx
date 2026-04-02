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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user on mount
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login for UI demonstration
      if (email && password) {
        const mockUser = {
          id: 1,
          name: 'John Smith',
          email: email,
          role: 'admin',
          avatar: 'JS'
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUser(mockUser);
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return { user: mockUser, token: 'mock-token' };
      } else {
        throw new Error('Please enter email and password');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Mock logout
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
