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
      // If there is stored user data, show it immediately for better UX
      const storedUser = tokenManager.getUserData();
      if (storedUser) {
        setUser(storedUser);
      }

      // If we have a token, try to validate it
      if (tokenManager.isAuthenticated()) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
          // Update stored user data with fresh data from server
          tokenManager.setUserData(response.user);
        } catch (error) {
          // Token is invalid, remove it and clear persistence + stored user
          tokenManager.removeToken();
          tokenManager.clearPersist();
          tokenManager.removeUserData();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    // Always store user data for persistence
    tokenManager.setUserData(userData);
  };

  const logout = () => {
    tokenManager.removeToken();
    tokenManager.clearPersist();
    tokenManager.removeUserData();
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