import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { User } from "lucide-react";
import Login from "../auth/Login";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleTranslate from "./GoogleTranslate";

const Header = ({ supplierInfo, cartCount = 0, onCartClick }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, login, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
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
    { label: 'Trending', path: '/trending' },
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
      <header className="bg-white shadow-sm py-2 px-4 sm:px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: Small Logo and App Name */}
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="sm:h-8 w-auto" />
          </span>
          <div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              VyapaarSetu
            </div>
          </div>
        </div>

        {/* Center: role-based nav (shows only for vendor or supplier when logged in) */}
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
        <div className="flex items-center gap-2 sm:gap-1">
          {/* Google Translate */}
          <GoogleTranslate />

          {!user && !isLoading && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm"
              onClick={handleLoginClick}
            >
              Login / Signup
            </button>
          )}
          {isLoading && (
            <div className="text-gray-500 text-sm">Loading...</div>
          )}

          {user && (
            <>
              {/* Cart (vendor only) */}
              {user.role === 'vendor' && (
                <button 
                  onClick={onCartClick}
                  className={`flex items-center gap-2 border px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition ml-2 relative text-sm ${
                    cartCount > 0 ? 'border-green-300 bg-green-50' : ''
                  }`}
                >
                  <FaShoppingCart className={`text-lg transition-transform ${cartCount > 0 ? 'scale-110' : ''}`} />
                  <span>Cart ({cartCount})</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Profile button + dropdown (use lucide user icon, no chevron) */}
              <div className="relative ml-2" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowLanguageDropdown(false);
                  }}
                  className="flex items-center justify-center w-10 h-10 border border-black rounded-full hover:bg-gray-100 transition text-sm"
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5 text-black" stroke="#000" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 py-1">
                    <div className="px-4 py-2 border-b text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Welcome</span>
                      <span className="font-medium truncate">{user.name}</span>
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
    </>
  );
};

export default Header;
