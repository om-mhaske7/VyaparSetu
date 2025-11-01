import React, { useEffect, useState, useRef } from "react";

const SCRIPT_ID = "google-translate-script";

const setLanguageCookie = (lang) => {
  document.cookie = `googtrans=/en/${lang}; path=/`;
  window.location.reload();
};

const resetLanguageCookie = () => {
  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  window.location.reload();
};

const GoogleTranslate = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Load Google Translate script robustly
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,mr,gu", // <--- Gujarati added here
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element_hidden"
      );
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLanguageChange = (lang) => {
    if (lang === "en") {
      resetLanguageCookie();
    } else {
      setLanguageCookie(lang);
    }
    setShowDropdown(false);
  };

  // Hide Google Translate banner
  useEffect(() => {
    const hideTranslateBar = () => {
      const banner = document.querySelector(".goog-te-banner-frame");
      const balloon = document.querySelector(".goog-te-balloon-frame");
      const tooltip = document.querySelector("#goog-gt-tt");

      if (banner) banner.style.display = "none";
      if (balloon) balloon.style.display = "none";
      if (tooltip) tooltip.style.display = "none";
      
      document.body.style.top = "0px";
    };

    // Run once after a short delay to ensure Google's script has loaded
    const timeoutId = setTimeout(hideTranslateBar, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Custom Toggle Button */}
      <button
        id="translateToggle"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center bg-gray-50 border rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-gray-100 transition text-xs sm:text-sm text-gray-700 whitespace-nowrap"
      >
        <span className="hidden sm:inline">Translate</span>
        <span className="sm:hidden">🌐</span>
      </button>

      {/* Our Custom Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[140px] z-50"
        >
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm text-gray-700"
            onClick={() => handleLanguageChange("mr")}
          >
            मराठी
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm text-gray-700"
            onClick={() => handleLanguageChange("hi")}
          >
            हिंदी
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm text-gray-700"
            onClick={() => handleLanguageChange("en")}
          >
            English
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-gray-100 transition text-sm text-gray-700"
            onClick={() => handleLanguageChange("gu")}
          >
            ગુજરાતી
          </button>
        </div>
      )}

      {/* Hidden div to hold the *actual* Google widget */}
      <div
        id="google_translate_element_hidden"
        style={{ display: "none" }}
      ></div>

      {/* Styles for the *widget* and *our dropdown* ONLY */}
      <style>{`
        /* Hide the default Google widget and all its parts */
        #google_translate_element_hidden,
        .goog-te-gadget,
        .goog-te-combo,
        .goog-te-combo select,
        .goog-te-combo .goog-te-menu-value {
          display: none !important;
          visibility: hidden !important;
        }

        /* Hide specific Google elements if they appear */
        .VIpgJd-ZVi9od-ORHb-OEVmCD, /* The Google logo container */
        .VIpgJd-ZVi9od-ORHb-OEVmCD img { /* The Google logo itself */
            display: none !important;
            visibility: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;
