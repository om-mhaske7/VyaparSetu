import React, { useState, useEffect, useRef } from "react";
import {
  FaShoppingCart,
  FaGlobeAsia,
  FaUserFriends,
  FaStar,
  FaChevronDown,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Login from "../auth/Login";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = ({ supplierInfo, cartCount = 0, onCartClick }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [showLogin, setShowLogin] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, login, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLoginClick = () => setShowLogin(true);

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'mr', name: 'मराठी' }
  ];

  const getCurrentLanguageName = () => {
    const currentLang = languageOptions.find(lang => lang.code === language);
    return currentLang ? currentLang.name : 'English';
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  const handleLoginSuccess = (userData) => {
    login(userData);
    setShowLogin(false);
    if (userData.role === "vendor") {
      if (location.pathname !== "/home") {
        navigate("/home");
      }
    } else if (userData.role === "supplier") {
      navigate("/supplier");
    } else if (userData.role === "admin") {
      navigate("/admin");
    }
  };
  const handleLogout = () => {
    const prevRole = user?.role;
    logout();
    if (prevRole === 'vendor') {
      navigate('/');
    }
  };

  // Detect routes
  const isSupplier = location.pathname === "/supplier";
  const isAdmin = location.pathname === "/admin";

  return (
    <>
      <header className="bg-white shadow-sm py-3 px-4 sm:px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: Small Logo and App Name */}
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="sm:h-8 w-auto" />
          </span>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {t('title') || 'VyapaarSetu'}
            </div>
          </div>
        </div>

        {/* Right: Language Dropdown, Login/Signup or User Info/Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center bg-gray-50 border rounded-lg px-2 py-2 hover:bg-gray-100 transition text-sm"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <FaGlobeAsia className="mr-2 text-gray-500" />
              <span className="font-medium text-gray-700">{getCurrentLanguageName()}</span>
              <FaChevronDown className={`ml-2 text-gray-500 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showLanguageDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm ${
                      language === lang.code ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!user && !isLoading && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm"
              onClick={handleLoginClick}
            >
              {t('loginSignup')}
            </button>
          )}
          {isLoading && (
            <div className="text-gray-500 text-sm">Loading...</div>
          )}
          {user && (
            <>
              <div className="text-right ml-2">
                <div className="text-gray-500 text-xs">Welcome</div>
                <div className="font-medium text-gray-800 text-sm">{user.name}</div>
              </div>
              {user.role === 'vendor' && (
                <button 
                  onClick={onCartClick}
                  className={`flex items-center gap-2 border px-3 py-1 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition ml-2 relative text-sm ${
                    cartCount > 0 ? 'border-green-300 bg-green-50' : ''
                  }`}
                >
                  <FaShoppingCart className={`text-lg transition-transform ${cartCount > 0 ? 'scale-110' : ''}`} />
                  <span>
                    {t('cart')} ({cartCount})
                  </span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}
              <button className="ml-2 text-xs text-red-600 hover:underline cursor-pointer" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
        {showLogin && <Login onSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />}
      </header>
      {/* removed extra vendor/subtitle blocks for a simpler header */}
    </>
  );
};

export default Header;
