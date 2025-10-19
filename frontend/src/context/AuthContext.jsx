import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager } from '../services/api';

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
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      // Only attempt to restore session if user previously chose to persist auth
      if (tokenManager.isPersisted() && tokenManager.isAuthenticated()) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          // Token is invalid, remove it and clear persistence
          tokenManager.removeToken();
          tokenManager.clearPersist();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = () => {
    tokenManager.removeToken();
    tokenManager.clearPersist();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 