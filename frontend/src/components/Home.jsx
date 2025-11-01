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

// Format distance display
function formatDistance(distance) {
  if (!distance) return 'Distance not available';
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Helper function to map API data to frontend format
function mapApiProductToFrontend(apiProduct, vendorLat = null, vendorLon = null) {
  const supplierLat = apiProduct.supplierId?.latitude;
  const supplierLon = apiProduct.supplierId?.longitude;
  
  let distance = null;
  if (vendorLat && vendorLon && supplierLat && supplierLon) {
    distance = calculateDistance(vendorLat, vendorLon, supplierLat, supplierLon);
  }
  
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.pricePerUnit,
    supplier: apiProduct.supplierId?.name || 'Unknown Supplier',
    supplierId: apiProduct.supplierId?._id || apiProduct.supplierId,
    supplierLat: supplierLat,
    supplierLon: supplierLon,
    supplierPayment: {
      upiId: apiProduct.supplierId?.upiId || '',
      upiQrCode: apiProduct.supplierId?.upiQrCode || ''
    },
    vendorId: apiProduct.vendorId || null,
    distance: distance,
    image: apiProduct.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    address: apiProduct.supplierId?.address || "Location not specified",
    delivery: "Pickup, Local Delivery",
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
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated, user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [vendorLocation, setVendorLocation] = useState({ lat: null, lon: null });

  const toggleDetails = (id) => {
    setDetailsOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get vendor location on mount
  useEffect(() => {
    if (user && user.latitude && user.longitude) {
      setVendorLocation({ lat: user.latitude, lon: user.longitude });
    }
  }, [user]);

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
        // Debug: log raw API response to help verify supplier payload
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('Products API raw response:', response);
        }
        const vendorLat = user?.latitude || vendorLocation.lat;
        const vendorLon = user?.longitude || vendorLocation.lon;
        const mappedProducts = response.map(prod => mapApiProductToFrontend(prod, vendorLat, vendorLon));
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
          <div className="px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((item) => {
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedProduct(item)}
                    className="bg-white rounded-2xl shadow-sm flex flex-col cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden"
                  >
                    {/* Image Section - Top (padded, 3:4 aspect ratio) */}
                    <div className="relative w-full flex-shrink-0 p-3">
                      <div className="relative w-full" style={{ aspectRatio: '4 / 3' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover object-center rounded-2xl"
                        />
                        {item.verified && (
                          <div className="absolute top-2 left-2 bg-gray-700 bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                            Verified
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Section - Bottom */}
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      {/* Item Name */}
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-bold break-words flex-1">
                          {getTranslatedField(item, 'name', language)}
                        </h2>
                      </div>
                      
                      {/* Category/Supplier */}
                      <div className="text-sm text-gray-600 break-words truncate">
                        {getTranslatedField(item, 'supplier', language)}
                      </div>
                      
                      {/* Price and Distance */}
                      <div className="flex justify-between items-baseline mt-1">
                        <div className="text-green-700 font-bold text-base">
                          ₹{item.price} / {item.unit}
                        </div>
                        {item.distance !== null && item.distance !== undefined && (
                          <div className="text-xs text-gray-600 font-medium">
                            {formatDistance(item.distance)}
                          </div>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div className="text-xs text-gray-600 truncate">
                        {getTranslatedField(item, 'address', language)}
                      </div>
                      
                      {/* Stock */}
                      <div className="text-xs text-gray-500">
                        {item.inStock} {item.unit} in stock
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Overlay Modal */}
        {selectedProduct && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Image */}
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
              </div>
              
              <div className="p-6 space-y-4">
                {/* Item Name */}
                <h2 className="text-2xl font-bold">{getTranslatedField(selectedProduct, 'name', language)}</h2>
                
                {/* Supplier Info */}
                <div className="space-y-2">
                  <div className="text-gray-700 font-medium">
                    Supplier: {getTranslatedField(selectedProduct, 'supplier', language)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Location: {getTranslatedField(selectedProduct, 'address', language)}
                  </div>
                  {selectedProduct.supplierLat && selectedProduct.supplierLon && (
                    <div className="text-sm text-gray-600">
                      Coordinates: {selectedProduct.supplierLat.toFixed(6)}, {selectedProduct.supplierLon.toFixed(6)}
                    </div>
                  )}
                </div>
                
                {/* Distance Info */}
                {selectedProduct.distance !== null && selectedProduct.distance !== undefined ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-lg font-semibold text-green-700">
                      Distance: {formatDistance(selectedProduct.distance)}
                    </div>
                    {user && user.latitude && user.longitude && (
                      <div className="text-xs text-gray-600 mt-1">
                        From your location ({user.latitude.toFixed(4)}, {user.longitude.toFixed(4)})
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm text-yellow-700">
                      Distance calculation unavailable. Please ensure both vendor and supplier have location data.
                    </div>
                  </div>
                )}
                
                {/* Price and Stock */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <div className="text-2xl font-bold text-green-700">
                      ₹{selectedProduct.price} / {selectedProduct.unit}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedProduct.inStock} {selectedProduct.unit} in stock
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedProduct.description && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.4 7h10.8L17 13M7 13V5a2 2 0 012-2h6a2 2 0 012 2v8" />
                    </svg>
                    {t('addToCart')}
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;