import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, fallbackPath = '/' }) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If user's role is not in allowed roles, redirect to appropriate page
  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate page based on their role
    if (user.role === 'vendor') {
      // Vendors can access home page, so redirect there
      return <Navigate to="/" replace />;
    } else if (user.role === 'supplier') {
      return <Navigate to="/supplier" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // Fallback to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the correct role
  return children;
};

export default ProtectedRoute; 