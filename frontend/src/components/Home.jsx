import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { FaCheck, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';

// Demo translation map for product fields
const productTranslations = {
  "Chaat Stall Starter": {
    hi: "चाट स्टाल स्टार्टर"
  },
  "Mumbai Fresh Supplies": {
    hi: "मुंबई फ्रेश सप्लाइज"
  },
  "Andheri West, Mumbai": {
    hi: "अंधेरी वेस्ट, मुंबई"
  }
};

function translateField(text, language) {
  if (language === "en") return text;
  return productTranslations[text]?.[language] || text;
}

function getTranslatedField(item, field, language) {
  if (language === "en") return item[field];
  return item.translations?.[language]?.[field] || item[field];
}

function RatingStars({ value }) {
  const fullStars = Math.floor(value);
  const halfStar = value % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span className="text-yellow-400">
      {"★".repeat(fullStars)}
      {halfStar ? "½" : ""}
      <span className="text-gray-300">
        {"★".repeat(emptyStars)}
      </span>
    </span>
  );
}

// Helper function to map API data to frontend format
function mapApiProductToFrontend(apiProduct) {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.pricePerUnit,
    supplier: apiProduct.supplierId?.name || 'Unknown Supplier',
    supplierId: apiProduct.supplierId?._id || apiProduct.supplierId, // Add supplierId
    vendorId: apiProduct.vendorId || null, // Add vendorId if available
    rating: 4.2, // Default rating since API doesn't provide this yet
    ratingCount: Math.floor(Math.random() * 200) + 50, // Random count for demo
    image: apiProduct.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    address: "Location not specified", // API doesn't provide address yet
    delivery: "Pickup, Local Delivery", // Default delivery options
    phone: apiProduct.supplierId?.phone || "+91 98765 43210",
    verified: apiProduct.supplierId?.isVerified || false,
    inStock: apiProduct.stockQty,
    unit: apiProduct.unit,
    description: apiProduct.description,
    translations: {
      en: { 
        name: apiProduct.name, 
        supplier: apiProduct.supplierId?.name || 'Unknown Supplier', 
        address: "Location not specified" 
      },
      hi: { 
        name: apiProduct.name, 
        supplier: apiProduct.supplierId?.name || 'Unknown Supplier', 
        address: "Location not specified" 
      }
    }
  };
}

function Home({ onAddToCart }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [addedToCart, setAddedToCart] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in product name
      const productName = getTranslatedField(product, 'name', language).toLowerCase();
      if (productName.includes(searchLower)) {
        console.log(`Match found in product name: ${product.name}`);
        return true;
      }
      
      // Search in product description
      if (product.description && product.description.toLowerCase().includes(searchLower)) {
        console.log(`Match found in product description: ${product.name}`);
        return true;
      }
      
      // Search in supplier name
      const supplierName = getTranslatedField(product, 'supplier', language).toLowerCase();
      if (supplierName.includes(searchLower)) {
        console.log(`Match found in supplier name: ${product.name}`);
        return true;
      }
      
      // Search in unit
      if (product.unit && product.unit.toLowerCase().includes(searchLower)) {
        console.log(`Match found in unit: ${product.name}`);
        return true;
      }
      
      // Search in address
      const address = getTranslatedField(product, 'address', language).toLowerCase();
      if (address.includes(searchLower)) {
        console.log(`Match found in address: ${product.name}`);
        return true;
      }
      
      return false;
    });
    
    console.log(`Search term: "${searchTerm}" - Found ${filtered.length} products`);
    setFilteredProducts(filtered);
  }, [searchTerm, products, language]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getProducts();
        const mappedProducts = response.map(mapApiProductToFrontend);
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to fetch products');
        // Fallback to demo products if API fails
        const demoProducts = [
          {
            id: 1,
            name: "Chaat Stall Starter",
            price: 700,
            supplier: "Mumbai Fresh Supplies",
            supplierId: "507f1f77bcf86cd799439011", // Valid ObjectId format
            vendorId: "507f1f77bcf86cd799439012", // Valid ObjectId format
            rating: 4.2,
            ratingCount: 127,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
            address: "Andheri West, Mumbai",
            delivery: "Pickup, Local Delivery",
            phone: "+91 98765 43210",
            verified: true,
            inStock: 15,
            unit: "pack",
            description: "Complete starter kit for chaat stall including all essential ingredients and spices",
            translations: {
              en: { name: "Chaat Stall Starter", supplier: "Mumbai Fresh Supplies", address: "Andheri West, Mumbai" },
              hi: { name: "चाट स्टाल स्टार्टर", supplier: "मुंबई फ्रेश सप्लाइज", address: "अंधेरी वेस्ट, मुंबई" }
            }
          },
          {
            id: 2,
            name: "Street Food Combo",
            price: 1200,
            supplier: "Delhi Street Foods",
            supplierId: "507f1f77bcf86cd799439013", // Valid ObjectId format
            vendorId: "507f1f77bcf86cd799439012", // Valid ObjectId format
            rating: 4.5,
            ratingCount: 89,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80",
            address: "Chandni Chowk, Delhi",
            delivery: "Pickup, Express Delivery",
            phone: "+91 98765 43211",
            verified: true,
            inStock: 8,
            unit: "combo",
            description: "Assorted street food items perfect for events and gatherings",
            translations: {
              en: { name: "Street Food Combo", supplier: "Delhi Street Foods", address: "Chandni Chowk, Delhi" },
              hi: { name: "स्ट्रीट फूड कॉम्बो", supplier: "दिल्ली स्ट्रीट फूड्स", address: "चांदनी चौक, दिल्ली" }
            }
          },
          {
            id: 3,
            name: "South Indian Breakfast Kit",
            price: 950,
            supplier: "Bangalore Tiffin Center",
            supplierId: "507f1f77bcf86cd799439014", // Valid ObjectId format
            vendorId: "507f1f77bcf86cd799439012", // Valid ObjectId format
            rating: 4.7,
            ratingCount: 203,
            image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
            address: "Koramangala, Bangalore",
            delivery: "Home Delivery",
            phone: "+91 98765 43212",
            verified: true,
            inStock: 12,
            unit: "kit",
            description: "Traditional South Indian breakfast items including idli, dosa, and chutneys",
            translations: {
              en: { name: "South Indian Breakfast Kit", supplier: "Bangalore Tiffin Center", address: "Koramangala, Bangalore" },
              hi: { name: "दक्षिण भारतीय नाश्ता किट", supplier: "बैंगलोर टिफिन सेंटर", address: "कोरमंगला, बैंगलोर" }
            }
          },
          {
            id: 4,
            name: "Organic Mangoes",
            price: 450,
            supplier: "Organic Farm Fresh",
            supplierId: "507f1f77bcf86cd799439015", // Valid ObjectId format
            vendorId: "507f1f77bcf86cd799439012", // Valid ObjectId format
            rating: 4.8,
            ratingCount: 156,
            image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80",
            address: "Nashik, Maharashtra",
            delivery: "Home Delivery, Express",
            phone: "+91 98765 43213",
            verified: true,
            inStock: 25,
            unit: "kg",
            description: "Fresh organic mangoes grown without pesticides, perfect for health-conscious consumers",
            translations: {
              en: { name: "Organic Mangoes", supplier: "Organic Farm Fresh", address: "Nashik, Maharashtra" },
              hi: { name: "ऑर्गेनिक आम", supplier: "ऑर्गेनिक फार्म फ्रेश", address: "नासिक, महाराष्ट्र" }
            }
          },
          {
            id: 5,
            name: "Organic Vegetables Pack",
            price: 350,
            supplier: "Green Earth Organics",
            supplierId: "507f1f77bcf86cd799439016", // Valid ObjectId format
            vendorId: "507f1f77bcf86cd799439012", // Valid ObjectId format
            rating: 4.6,
            ratingCount: 89,
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
            address: "Pune, Maharashtra",
            delivery: "Home Delivery",
            phone: "+91 98765 43214",
            verified: true,
            inStock: 18,
            unit: "pack",
            description: "Assorted organic vegetables including tomatoes, carrots, and spinach",
            translations: {
              en: { name: "Organic Vegetables Pack", supplier: "Green Earth Organics", address: "Pune, Maharashtra" },
              hi: { name: "ऑर्गेनिक सब्जियां पैक", supplier: "ग्रीन अर्थ ऑर्गेनिक्स", address: "पुणे, महाराष्ट्र" }
            }
          },
        ];
        setProducts(demoProducts);
        setFilteredProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    
    onAddToCart(product);
    setAddedToCart(product.name);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t('featuredProducts') || 'Featured Products'}
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t('featuredProducts') || 'Featured Products'}
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️ Error loading products</div>
              <div className="text-gray-600 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Success Notification */}
      {addedToCart && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <FaCheck />
          <span>{getTranslatedField({ name: addedToCart, translations: products.find(p => p.name === addedToCart)?.translations }, 'name', language)} added to cart!</span>
        </div>
      )}
      
      {/* Login Prompt Notification */}
      {showLoginPrompt && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{language === 'hi' ? 'कार्ट में जोड़ने के लिए लॉगिन करें' : 'Please login to add to cart'}</span>
        </div>
      )}
      
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-10 sm:py-14 md:py-16 px-2 sm:px-4 md:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2 md:mb-4">
              {language === 'hi' ? 'अपने उत्पाद खोजें' : 'Find Your Products'}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'hi' 
                ? 'हजारों गुणवत्तापूर्ण उत्पादों में से चुनें और सर्वोत्तम आपूर्तिकर्ताओं से खरीदें' 
                : 'Discover thousands of quality products from the best suppliers'
              }
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'hi' ? 'उत्पाद, आपूर्तिकर्ता, या विवरण खोजें...' : 'Search products, suppliers, or descriptions...'}
                className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 sm:focus:ring-4 focus:ring-green-200 focus:border-green-500 text-gray-900 shadow-md sm:shadow-lg transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center hover:bg-gray-100 rounded-r-xl sm:rounded-r-2xl transition-colors duration-200"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            {searchTerm && (
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
                {filteredProducts.length === 0 ? (
                  <span className="bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm inline-block">
                    {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
                  </span>
                ) : (
                  <span className="bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm inline-block">
                    {language === 'hi' 
                      ? `${filteredProducts.length} उत्पाद मिले` 
                      : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`
                    }
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        
        {filteredProducts.length === 0 && !loading && !error ? (
          <div className="text-center py-8 sm:py-10">
            <div className="text-gray-500 text-base sm:text-lg">
              {searchTerm 
                ? (language === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products found') 
                : (language === 'hi' ? 'कोई उत्पाद उपलब्ध नहीं है' : 'No products available')
              }
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
              >
                {language === 'hi' ? 'सभी उत्पाद देखें' : 'View all products'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 justify-items-center">
            {filteredProducts.map((item) => (
              <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg w-full max-w-xs sm:max-w-sm flex flex-col">
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded-t-xl sm:rounded-t-2xl h-40 sm:h-48 w-full object-cover object-center"
                />
                <div className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold break-words">{getTranslatedField(item, 'name', language)}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                    <div className="text-green-700 text-xl sm:text-2xl font-bold">
                      ₹{item.price} / {item.unit}
                    </div>
                    {item.verified && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mt-1 sm:mt-0 ml-0 sm:ml-2">
                        {t('verified')}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 font-medium break-words">{getTranslatedField(item, 'supplier', language)}</div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <RatingStars value={item.rating} />
                    <span className="text-gray-500 text-xs sm:text-sm">
                      ({item.ratingCount})
                    </span>
                  </div>
                  <hr className="my-1 sm:my-2" />
                  <div className="text-gray-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243 4.243z" /></svg>
                    {getTranslatedField(item, 'address', language)}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 4v8" /></svg>
                    {item.delivery}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.4 7h10.8L17 13M7 13V5a2 2 0 012-2h6a2 2 0 012 2v8" /></svg>
                    {item.phone}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 mt-2 sm:mt-4">
                    <span className="text-green-700 font-semibold text-sm sm:text-base">{item.inStock} {item.unit} {t('inStock')}</span>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="ml-0 sm:ml-auto bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2 rounded-lg flex items-center gap-1 sm:gap-2 font-semibold shadow transition duration-150 cursor-pointer min-w-[120px] sm:min-w-[140px] justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.4 7h10.8L17 13M7 13V5a2 2 0 012-2h6a2 2 0 012 2v8" /></svg>
                      {t('addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;