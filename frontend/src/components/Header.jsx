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

  // Close dropdown when clicking outside
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
  
  // Language options
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
    // Redirect based on role only if not already on the correct page
    if (userData.role === "vendor") {
      // Vendors can stay on home page, no need to redirect
      if (location.pathname !== "/") {
        navigate("/");
      }
    } else if (userData.role === "supplier") {
      navigate("/supplier");
    } else if (userData.role === "admin") {
      navigate("/admin");
    }
  };
  const handleLogout = () => {
    logout();
  };

  // Detect if on /supplier route
  const isSupplier = location.pathname === "/supplier";
  // Detect if on /admin route
  const isAdmin = location.pathname === "/admin";

  return (
    <>
      <header className="bg-white shadow-md py-3 px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        {/* Left: Logo and App Name */}
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-3xl flex-shrink-0">
            <span role="img" aria-label="logo">🌱</span>
          </span>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {t('title')}
              <span className="hidden sm:flex items-center text-gray-700 text-base font-normal ml-2 whitespace-nowrap">
                <FaUserFriends className="mr-1" />
                {t('vendors')}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 -mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{t('subtitle')}</div>
          </div>
        </div>

        {/* Right: Language Dropdown, Login/Signup or User Info/Cart */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end mt-2 sm:mt-0">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center bg-gray-50 border rounded-lg px-2 sm:px-3 py-2 hover:bg-gray-100 transition text-sm sm:text-base"
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
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm sm:text-base ${
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
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto"
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
              <div className="text-right ml-2 sm:ml-4">
                <div className="text-gray-500 text-xs sm:text-sm">Welcome</div>
                <div className="font-medium text-gray-800 text-sm sm:text-base">{user.name}</div>
              </div>
              {user && user.role === 'vendor' && (
                <button 
                  onClick={onCartClick}
                  className={`flex items-center gap-2 border px-3 sm:px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition ml-2 sm:ml-4 relative text-sm sm:text-base w-full sm:w-auto ${
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
              <button className="ml-2 sm:ml-4 text-xs sm:text-sm text-red-600 hover:underline cursor-pointer w-full sm:w-auto" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
        {showLogin && <Login onSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />}
      </header>
      {/* Supplier extra header content */}
      {/* {isSupplier && supplierInfo && (
        <div className="bg-white shadow-sm px-8 pb-2 flex items-center justify-between">
          <div className="text-right">
            <div className="text-gray-500 text-sm">Welcome,</div>
            <div className="font-medium text-gray-800">{supplierInfo.name}</div>
          </div>
          <div className="flex items-center gap-1 text-yellow-600 font-semibold">
            <FaStar className="text-lg" />
            <span>{supplierInfo.rating}</span>
            <span className="text-gray-400 text-xs">({supplierInfo.reviews} reviews)</span>
          </div>
        </div>
      )} */}
    </>
  );
};

export default Header;
