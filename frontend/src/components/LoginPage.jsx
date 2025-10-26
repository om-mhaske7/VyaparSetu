import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../auth/Login';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSuccess = (userData) => {
    login(userData);
    // Navigate based on user role
    if (userData.role === 'vendor') {
      navigate('/home');
    } else if (userData.role === 'supplier') {
      navigate('/supplier');
    } else if (userData.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 flex items-center justify-center">
      <Login onSuccess={handleLoginSuccess} onClose={handleClose} />
    </div>
  );
};

export default LoginPage;
