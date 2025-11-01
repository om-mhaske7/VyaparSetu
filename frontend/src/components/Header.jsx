import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaStar, FaBars, FaTimes } from "react-icons/fa";
import { User } from "lucide-react";
import Login from "../auth/Login";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleTranslate from "./GoogleTranslate";

const Header = ({ supplierInfo, cartCount = 0, onCartClick }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, login, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLoginClick = () => setShowLogin(true);

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
    setShowProfileDropdown(false);
    if (prevRole === 'vendor') {
      navigate('/');
    }
  };

  // Detect routes
  const isSupplier = location.pathname === "/supplier";
  const isAdmin = location.pathname === "/admin";

  // Role-specific nav items
  const vendorNav = [
    { label: 'Home', path: '/home' },
    { label: 'Suppliers', path: '/search' },
  ];
  const supplierNav = [
    { label: 'Dashboard', path: '/supplier' },
    { label: 'Analytics', path: '/analyze' },
    { label: 'Maps', path: '/maps' },
  ];
  const navItems = user?.role === 'vendor' ? vendorNav : user?.role === 'supplier' ? supplierNav : [];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className="bg-white shadow-sm py-2 px-2 sm:px-4 md:px-6 flex items-center justify-between gap-2">
        {/* Left: Logo, App Name, and Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          {user && navItems.length > 0 && (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <FaTimes className="w-5 h-5 text-gray-700" />
              ) : (
                <FaBars className="w-5 h-5 text-gray-700" />
              )}
            </button>
          )}
          
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-6 w-auto sm:h-8" />
            </span>
            <div>
              <div className="text-base sm:text-lg md:text-2xl font-bold text-green-600 whitespace-nowrap">
                VyapaarSetu
              </div>
            </div>
          </div>
        </div>

        {/* Center: role-based nav (shows only for vendor or supplier when logged in, desktop only) */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-3 ml-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-md text-base font-medium transition ${
                  isActive(item.path)
                    ? 'text-green-600 bg-green-50 border border-green-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right: Language Dropdown, Login/Signup or User Info/Cart/Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Google Translate */}
          <GoogleTranslate />

          {!user && !isLoading && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap"
              onClick={handleLoginClick}
            >
              <span className="hidden sm:inline">Login / Signup</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
          {isLoading && (
            <div className="text-gray-500 text-xs sm:text-sm">Loading...</div>
          )}

          {user && (
            <>
              {/* Cart (vendor only) */}
              {user.role === 'vendor' && (
                <button 
                  onClick={onCartClick}
                  className={`hidden sm:flex items-center gap-2 border px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition relative text-xs sm:text-sm ${
                    cartCount > 0 ? 'border-green-300 bg-green-50' : ''
                  }`}
                >
                  <FaShoppingCart className={`text-base sm:text-lg transition-transform ${cartCount > 0 ? 'scale-110' : ''}`} />
                  <span>Cart ({cartCount})</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Cart Icon */}
              {user.role === 'vendor' && (
                <button 
                  onClick={onCartClick}
                  className="sm:hidden relative p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Cart"
                >
                  <FaShoppingCart className="text-lg text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile button + dropdown (use lucide user icon, no chevron) */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                  }}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border border-black rounded-full hover:bg-gray-100 transition text-sm"
                  aria-haspopup="true"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-black" stroke="#000" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 py-1">
                    <div className="px-4 py-2 border-b">
                      <div className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Welcome</span>
                        <span className="font-medium truncate">{user.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        ID: {user._id || user.id}
                      </div>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                      onClick={() => { setShowProfileDropdown(false); navigate('/settings'); }}
                    >
                      Settings
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showLogin && <Login onSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />}
      </header>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && user && navItems.length > 0 && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg" ref={mobileMenuRef}>
          <nav className="flex flex-col py-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
                className={`px-4 py-3 text-left font-medium transition ${
                  isActive(item.path)
                    ? 'text-green-600 bg-green-50 border-l-4 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
