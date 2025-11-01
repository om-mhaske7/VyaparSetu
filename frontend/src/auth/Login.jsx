import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI, tokenManager } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import MapPicker from "./MapPicker";
import { 
  validateEmail, 
  validatePassword, 
  validatePhone, 
  validateName, 
  validateAddress,
  cleanPhoneNumber
} from "../utils/validations";

const roles = ["vendor", "supplier"];

const Login = ({ onSuccess, onClose }) => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [location, setLocation] = useState(null);

  const handleLocationSelect = (coordinates) => {
    setLocation(coordinates);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValidation = validateEmail(loginId);
    const passwordValidation = validatePassword(loginPassword);
    
    const errors = {};
    if (!emailValidation.isValid) errors.loginId = emailValidation.message;
    if (!passwordValidation.isValid) errors.loginPassword = passwordValidation.message;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setIsLoading(true);
    setError("");
    try {
      const response = await authAPI.login({
        email: loginId,
        password: loginPassword,
      });
      const token =
        response?.token ||
        response?.data?.token ||
        response?.user?.token ||
        response?.accessToken ||
        null;
      const persist = rememberMe || true;
      tokenManager.setToken(token, persist);

      let fullUser = response.user || response;
      try {
        const me = await authAPI.getCurrentUser();
        if (me) fullUser = me.user || me;
      } catch {}
      if (persist) tokenManager.setUserData(fullUser);
      login(fullUser);
      onSuccess(fullUser);
    } catch (err) {
      setError(err.message || t("loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate all inputs
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(signupPassword);
    const phoneValidation = validatePhone(phone);
    const addressValidation = validateAddress(address);
    
    const errors = {};
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!emailValidation.isValid) errors.email = emailValidation.message;
    if (!passwordValidation.isValid) errors.signupPassword = passwordValidation.message;
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    if (!addressValidation.isValid) errors.address = addressValidation.message;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    if (!location) {
      setError("Please select your location on the map");
      return;
    }
    
    setFieldErrors({});
    setIsLoading(true);
    setError("");
    try {
      const response = await authAPI.register({
        name,
        email,
        password: signupPassword,
        phone: cleanPhoneNumber(phone),
        role,
        address,
        latitude: location[0],
        longitude: location[1],
      });
      const token =
        response?.token ||
        response?.data?.token ||
        response?.user?.token ||
        response?.accessToken ||
        null;
      const persist = rememberMe || true;
      tokenManager.setToken(token, persist);

      let fullUser = response.user || response;
      try {
        const me = await authAPI.getCurrentUser();
        if (me) fullUser = me.user || me;
      } catch {}
      if (persist) tokenManager.setUserData(fullUser);
      login(fullUser);
      onSuccess(fullUser);
    } catch (err) {
      setError(err.message || t("signupFailed"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Phone change handler to clean the input
  const handlePhoneChange = (e) => {
    const cleaned = cleanPhoneNumber(e.target.value);
    setPhone(cleaned);
    // Clear error when user starts typing
    if (fieldErrors.phone) {
      setFieldErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="login-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 bg-gradient-to-br from-green-100 via-white to-green-50 flex items-center justify-center z-50 overflow-hidden"
      >
        {/* Static geometric shapes with depth */}
        <div className="absolute w-64 h-64 bg-green-200 rounded-full top-10 left-10 opacity-30 shadow-lg"></div>
        <div className="absolute w-72 h-72 bg-green-300 rounded-full bottom-10 right-10 opacity-20 shadow-md"></div>

        {/* Modal Card with glassmorphism */}
        <motion.div
          key="login-modal"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative backdrop-blur-xl bg-white/40 border border-white/30 rounded-2xl shadow-2xl p-8 w-full max-w-md z-20 max-h-[90vh] overflow-y-auto"
        >
          <button
            className="absolute top-3 right-4 text-gray-400 hover:text-green-600 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label={t("close")}
          >
            ×
          </button>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-4 gap-4">
            <button
              className={`font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-sm border ${
                !isSignup
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50"
              }`}
              onClick={() => {
                setIsSignup(false);
                setError("");
              }}
            >
              {t("login")}
            </button>
            <button
              className={`font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-sm border ${
                isSignup
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50"
              }`}
              onClick={() => {
                setIsSignup(true);
                setError("");
              }}
            >
              {t("signup")}
            </button>
          </div>
          <div className="w-full border-b border-gray-200 mb-6"></div>

          {/* Form Sections */}
          <AnimatePresence mode="wait">
            {isSignup ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-lg font-bold mb-2 text-green-700 text-center tracking-wide">
                  {t("createAccount")}
                </h2>
                <form onSubmit={handleSignup} className="flex flex-col gap-2 mt-2">
                  <div>
                    <input
                      type="text"
                      placeholder={t("Owner name")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.name ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.name && <div className="text-red-500 text-xs mt-1">{fieldErrors.name}</div>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder={t("Business email")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.email ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder={t("password")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.signupPassword ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={signupPassword}
                      onChange={(e) => {
                        setSignupPassword(e.target.value);
                        if (fieldErrors.signupPassword) {
                          setFieldErrors(prev => ({ ...prev, signupPassword: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.signupPassword && <div className="text-red-500 text-xs mt-1">{fieldErrors.signupPassword}</div>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder={t("Business phone number")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.phone ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength="10"
                    />
                    {fieldErrors.phone && <div className="text-red-500 text-xs mt-1">{fieldErrors.phone}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t("Business address")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.address ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) {
                          setFieldErrors(prev => ({ ...prev, address: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.address && <div className="text-red-500 text-xs mt-1">{fieldErrors.address}</div>}
                  </div>
                  <MapPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={location}
                    userRole={role}
                  />
                  <select
                    className="border border-green-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {t(r)}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-gray-600">
                      {t("rememberMe") || "Remember me"}
                    </span>
                  </label>
                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 shadow-md transition-all ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? t("signingUp") : t("signup")}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-lg font-bold mb-2 text-green-700 text-center tracking-wide">
                  {t("welcomeBack")}
                </h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-2 mt-2">
                  <div>
                    <input
                      type="text"
                      placeholder={t("email")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.loginId ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        if (fieldErrors.loginId) {
                          setFieldErrors(prev => ({ ...prev, loginId: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.loginId && <div className="text-red-500 text-xs mt-1">{fieldErrors.loginId}</div>}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder={t("password")}
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 transition ${fieldErrors.loginPassword ? 'border-red-500 focus:ring-red-300' : 'border-green-200 focus:ring-green-300'}`}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (fieldErrors.loginPassword) {
                          setFieldErrors(prev => ({ ...prev, loginPassword: undefined }));
                        }
                      }}
                    />
                    {fieldErrors.loginPassword && <div className="text-red-500 text-xs mt-1">{fieldErrors.loginPassword}</div>}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-gray-600">
                      {t("rememberMe") || "Remember me"}
                    </span>
                  </label>
                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 shadow-md transition-all ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? t("loggingIn") : t("login")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Login;
