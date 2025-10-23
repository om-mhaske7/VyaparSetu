import React, { useState, useEffect } from "react";
import { authAPI, tokenManager } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import MapPicker from "../components/MapPicker";

const roles = ["vendor", "supplier"];

const Login = ({ onSuccess, onClose }) => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [location, setLocation] = useState(null); // [latitude, longitude]

  const handleLocationSelect = (coordinates) => {
    setLocation(coordinates);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPassword) {
      setError(t('enterEmailPassword'));
      return;
    }
    
    setIsLoading(true);
    setError("");
    
      try {
        const response = await authAPI.login({
          email: loginId,
          password: loginPassword,
        });

  // Determine token from possible response shapes
  const token = response?.token || response?.data?.token || response?.user?.token || response?.accessToken || null;
  // Store token and user info
  // Make all sessions persistent by default (so refreshing stays logged in)
  const persist = rememberMe || true;
  tokenManager.setToken(token, persist);

        // Fetch authoritative user data from backend (includes verification status)
        let fullUser = response.user || response;
        try {
          const me = await authAPI.getCurrentUser();
          // backend may return { user: {...} } or the user object directly
          if (me) {
            if (me.user) fullUser = me.user;
            else fullUser = me;
          }
        } catch (err) {
          // If /auth/me fails, fall back to response.user
          console.warn('Failed to fetch current user after login, falling back to login response', err);
        }

        if (persist) tokenManager.setUserData(fullUser);
        login(fullUser);
        onSuccess(fullUser);
    } catch (err) {
      setError(err.message || t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !signupPassword || !phone || !role || !address) {
      setError(t('fillAllFields'));
      return;
    }
    if (!location) {
      setError('Please select your location on the map');
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await authAPI.register({
        name,
        email,
        password: signupPassword,
        phone,
        role,
        address,
        latitude: location[0],
        longitude: location[1],
      });

      // Store token and user info
      // For signup, persist by default for all roles
  const token = response?.token || response?.data?.token || response?.user?.token || response?.accessToken || null;
  const signupPersist = rememberMe || true;
  tokenManager.setToken(token, signupPersist);

      // Fetch authoritative user data
      let fullUser = response.user || response;
      try {
        const me = await authAPI.getCurrentUser();
        if (me) {
          if (me.user) fullUser = me.user;
          else fullUser = me;
        }
      } catch (err) {
        console.warn('Failed to fetch current user after signup, falling back to signup response', err);
      }

      if (signupPersist) tokenManager.setUserData(fullUser);
      login(fullUser);
      onSuccess(fullUser);
    } catch (err) {
      setError(err.message || t('signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to handle body overflow
  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-100 via-white to-green-50 bg-opacity-80 flex items-center justify-center z-50 overflow-y-hidden">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-green-100 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-green-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label={t('close')}
        >
          ×
        </button>
        <div className="flex justify-center mb-4 gap-4">
          <button
            className={`font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-sm border ${!isSignup ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}
            onClick={() => { setIsSignup(false); setError(""); }}
          >
            {t('login')}
          </button>
          <button
            className={`font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-sm border ${isSignup ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}
            onClick={() => { setIsSignup(true); setError(""); }}
          >
            {t('signup')}
          </button>
        </div>
        <div className="w-full border-b border-gray-200 mb-6"></div>
        {isSignup ? (
          <>
            <h2 className="text-lg font-bold mb-2 text-green-700 text-center tracking-wide">{t('createAccount')}</h2>
            <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-2">
              <input
                type="text"
                placeholder={t('Owner name')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder={t('Business email')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder={t('password')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
              />
              <input
                type="tel"
                placeholder={t('Business phone number')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <input
                type="text"
                placeholder={t('Business address') || 'Business address'}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <MapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={location}
                userRole={role}
              />
              <select
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {roles.map(r => <option key={r} value={r}>{t(r)}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="text-gray-600">{t('rememberMe') || 'Remember me'}</span>
              </label>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 shadow-md transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('signingUp') : t('signup')}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-2 text-green-700 text-center tracking-wide">{t('welcomeBack')}</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-2">
              <input
                type="text"
                placeholder={t('email')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
              />
              <input
                type="password"
                placeholder={t('password')}
                className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <span className="text-gray-600">{t('rememberMe') || 'Remember me'}</span>
              </label>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 shadow-md transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('loggingIn') : t('login')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;