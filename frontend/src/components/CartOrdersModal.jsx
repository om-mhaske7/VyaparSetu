import React, { useState, useEffect } from 'react';
import { FaTimes, FaShoppingCart, FaClipboardList, FaMinus, FaPlus, FaTrash, FaSort } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { orderAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CartOrdersModal = ({ cartItems, myOrders, onClose, onRemoveItem, onUpdateQuantity, onCheckout, initialTab = 'cart' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // Use initialTab prop
  // Update activeTab when parent changes initialTab (e.g., after checkout)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for latest first, 'asc' for oldest first
  const [productDetails, setProductDetails] = useState({}); // Cache for product details

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Function to sort orders
  const sortOrders = (orders, order) => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.orderedAt);
      const dateB = new Date(b.orderedAt);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  // Get sorted orders
  const sortedOrders = sortOrders(userOrders, sortOrder);

  // Create a mapping for consistent order numbers (oldest = #1, newest = highest number)
  const getOrderNumber = (order) => {
    // Sort all orders by date (oldest first) to assign consistent numbers
    const ordersByDate = [...userOrders].sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt));
    return ordersByDate.findIndex(o => o._id === order._id) + 1;
  };

  // Handler for toggling sort order
  const handleSortToggle = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  // Function to fetch product details
  const fetchProductDetails = async (productId) => {
    if (productDetails[productId]) {
      return productDetails[productId]; // Return cached data
    }

    try {
      const product = await productAPI.getProductById(productId);
      setProductDetails(prev => ({
        ...prev,
        [productId]: product
      }));
      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return { name: `Product ${productId}`, error: true }; // Fallback
    }
  };

  // Fetch user orders when orders tab is active
  useEffect(() => {
    const fetchUserOrders = async () => {
      const vendorId = user?._id || user?.id;
      if (activeTab === 'orders' && vendorId) {
        setOrdersLoading(true);
        try {
          const orders = await orderAPI.getVendorOrders(vendorId);
          setUserOrders(orders);
          
          // Fetch product details for all items in orders
          const productIds = new Set();
          orders.forEach(order => {
            order.items.forEach(item => {
              productIds.add(item.productId);
            });
          });
          
          // Fetch details for products not in cache
          const productPromises = Array.from(productIds).map(async (productId) => {
            if (!productDetails[productId]) {
              return fetchProductDetails(productId);
            }
          });
          
          await Promise.all(productPromises.filter(Boolean));
          
        } catch (error) {
          console.error('Error fetching user orders:', error);
          setUserOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    fetchUserOrders();
  }, [activeTab, user]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'upi'
  const [payerUpiId, setPayerUpiId] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [qrPreview, setQrPreview] = useState('');

  const getFileUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const apiRoot = apiBase.replace(/\/api\/?$/, '');
    return path.startsWith('/uploads') ? `${apiRoot}${path}` : path;
  };
  
  // Helper: get supplier list from cart for payment info rendering
  const suppliersInCart = React.useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      const sid = item.supplierId || item.supplier?._id || item.supplier;
      if (!sid) return;
      if (!map.has(sid)) {
        map.set(sid, {
          supplierId: sid,
          supplierName: item.supplier?.name || item.supplier?.businessName || item.supplierName || item.supplier || 'Supplier',
          // Try multiple likely locations for UPI/QR the app might use
          upiId: item.supplier?.upiId || item.supplierUpi || item.upiId || item.supplierId?.upiId || item.supplierPayment?.upiId || '',
          qrCode: item.supplier?.qrCode || item.supplierQr || item.qrCode || item.supplierId?.qrCode || item.supplierPayment?.upiQrCode || ''
        });
      } else {
        const s = map.get(sid);
        s.upiId = s.upiId || (item.supplier?.upiId || item.supplierUpi || item.upiId || item.supplierId?.upiId || item.supplierPayment?.upiId || '');
        s.qrCode = s.qrCode || (item.supplier?.qrCode || item.supplierQr || item.qrCode || item.supplierId?.qrCode || item.supplierPayment?.upiQrCode || '');
      }
    });
    return Array.from(map.values());
  }, [cartItems]);

  const isUpiAvailableForAll = suppliersInCart.length > 0 && suppliersInCart.every(s => Boolean(s.upiId || s.qrCode));
  
  // Handler for placing order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    try {
      // Validate against available stock before showing payment options
      const outOfStock = cartItems.find(item => {
        const available = Number(item.inStock ?? item.stockQty ?? 0);
        return available > 0 ? Number(item.quantity) > available : Number(item.quantity) > 0;
      });
      if (outOfStock) {
        alert(`${outOfStock.name}: only ${outOfStock.inStock ?? outOfStock.stockQty ?? 0} ${outOfStock.unit || ''} available. Reduce quantity before placing order.`);
        return;
      }
      
      // Show payment modal instead of directly placing order
      setSelectedPaymentMethod(null);
      setPaymentStep('select');
      setPayerUpiId('');
      setShowPaymentModal(true);
      return; // Stop here; actual order placement happens after method selection

      // Generate a valid MongoDB ObjectId format for vendorId if not available
      const generateObjectId = () => {
        return '507f1f77bcf86cd799439011'; // Valid demo ObjectId
      };
      
  const vendorId = user?._id || user?.id || user?.vendorId || generateObjectId();
      
      // Validate that vendorId is a valid ObjectId format (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const finalVendorId = objectIdRegex.test(vendorId) ? vendorId : generateObjectId();
      
      // Group cart items by supplier
      const itemsBySupplier = cartItems.reduce((groups, item) => {
        const supplierId = item.supplierId;
        if (!supplierId) {
          console.error('Item missing supplierId:', item);
          return groups;
        }
        
        if (!groups[supplierId]) {
          groups[supplierId] = [];
        }
        groups[supplierId].push(item);
        return groups;
      }, {});
      
      // Create separate orders for each supplier
      const orderPromises = Object.entries(itemsBySupplier).map(async ([supplierId, supplierItems]) => {
        // Normalize ids and prices before sending to backend
        const itemsPayload = supplierItems.map(item => {
          const productId = item._id || item.id || (item.productId && (item.productId._id || item.productId));
          const supplierIdForItem = item.supplierId || item.supplier?._id || item.supplier;
          let unitPrice = item.unitPrice ?? item.price;
          if (typeof unitPrice === 'string') {
            unitPrice = Number(unitPrice.toString().replace(/[^0-9.-]+/g, '')) || 0;
          }
          return {
            productId,
            supplierId: supplierIdForItem,
            quantity: item.quantity,
            unitPrice,
          };
        });

        const orderData = {
          vendorId: finalVendorId,
          supplierId,
          items: itemsPayload,
          deliveryType: 'pickup', // You can make this dynamic if needed
        };

        try {
          return await orderAPI.placeOrder(orderData);
        } catch (err) {
          console.error('Failed placing order for supplier', supplierId, { orderData, err });
          throw err;
        }
  });
      
      // Wait for all orders to be placed
      const results = await Promise.all(orderPromises);
      
      const orderCount = results.length;
      alert(`${orderCount} order${orderCount > 1 ? 's' : ''} placed successfully!`);
      
      // Clear cart after successful order
      if (onCheckout) {
        onCheckout();
      }
      
      // Automatically switch to My Orders tab and refresh orders
      setActiveTab('orders');
      
      setLoading(false);
      
      // Refresh orders after successful placement
      if (user) {
        try {
          const vendorIdRefresh = user._id || user.id || user.vendorId;
          if (vendorIdRefresh) {
            const orders = await orderAPI.getVendorOrders(vendorIdRefresh);
            setUserOrders(orders);
          }
          
          // Fetch product details for new orders
          const productIds = new Set();
          orders.forEach(order => {
            order.items.forEach(item => {
              productIds.add(item.productId);
            });
          });
          
          const productPromises = Array.from(productIds).map(async (productId) => {
            if (!productDetails[productId]) {
              return fetchProductDetails(productId);
            }
          });
          
          await Promise.all(productPromises.filter(Boolean));
          
        } catch (error) {
          console.error('Error refreshing orders:', error);
        }
      }
      
    } catch (error) {
      alert('Order failed: ' + error.message);
      setLoading(false);
    }
  };
  
  // helper to check available for UI controls
  const isAtMax = (item) => {
    const available = Number(item.inStock ?? item.stockQty ?? 0);
    return available > 0 ? item.quantity >= available : false;
  };

  const processOrder = async (paymentMethod) => {
    setLoading(true);
    try {
      // Generate a valid MongoDB ObjectId format for vendorId if not available
      const generateObjectId = () => {
        return '507f1f77bcf86cd799439011'; // Valid demo ObjectId
      };
      
      const vendorId = user?._id || user?.id || user?.vendorId || generateObjectId();
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const finalVendorId = objectIdRegex.test(vendorId) ? vendorId : generateObjectId();
      
      // Group cart items by supplier
      const itemsBySupplier = cartItems.reduce((groups, item) => {
        const supplierId = item.supplierId;
        if (!supplierId) {
          console.error('Item missing supplierId:', item);
          return groups;
        }
        
        if (!groups[supplierId]) {
          groups[supplierId] = [];
        }
        groups[supplierId].push(item);
        return groups;
      }, {});
      
      // Create separate orders for each supplier
      const orderPromises = Object.entries(itemsBySupplier).map(async ([supplierId, supplierItems]) => {
        const itemsPayload = supplierItems.map(item => {
          const productId = item._id || item.id || (item.productId && (item.productId._id || item.productId));
          const supplierIdForItem = item.supplierId || item.supplier?._id || item.supplier;
          let unitPrice = item.unitPrice ?? item.price;
          if (typeof unitPrice === 'string') {
            unitPrice = Number(unitPrice.toString().replace(/[^0-9.-]+/g, '')) || 0;
          }
          return {
            productId,
            supplierId: supplierIdForItem,
            quantity: item.quantity,
            unitPrice,
            paymentMethod
          };
        });

        const orderData = {
          vendorId: finalVendorId,
          supplierId,
          items: itemsPayload,
          deliveryType: 'pickup',
          paymentMethod,
          paymentDetails: paymentMethod === 'upi' ? { payerUpiId, transactionId: upiTxnId } : {}
        };

        return await orderAPI.placeOrder(orderData);
      });
      
      const results = await Promise.all(orderPromises);
      const orderCount = results.length;
      alert(`${orderCount} order${orderCount > 1 ? 's' : ''} placed successfully!`);
      
      if (onCheckout) {
        onCheckout();
      }
      
      setActiveTab('orders');
      setShowPaymentModal(false);
      setLoading(false);
      
      // Refresh orders
      if (user) {
        try {
          const vendorIdRefresh = user._id || user.id || user.vendorId;
          if (vendorIdRefresh) {
            const orders = await orderAPI.getVendorOrders(vendorIdRefresh);
            setUserOrders(orders);
          }
        } catch (error) {
          console.error('Error refreshing orders:', error);
        }
      }
      
    } catch (error) {
      alert('Order failed: ' + error.message);
      setLoading(false);
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
            {/* Razorpay-like header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-md p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 003 3 3 3 0 003-3v-1a3 3 0 00-3-3z" /></svg>
                </div>
                <div>
                  <div className="text-white font-semibold">Secure Checkout</div>
                  <div className="text-white/80 text-xs">UPI/COD • SSL Encrypted</div>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/90 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {paymentStep === 'select' && (
                <>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Select Payment Method</h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod('cod');
                        setPaymentStep('cod');
                      }}
                      className="w-full py-4 px-6 bg-gray-50 hover:bg-gray-100 border rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                          <div className="font-semibold">Cash on Delivery</div>
                          <div className="text-xs text-gray-500">Pay in cash at pickup/delivery</div>
                        </div>
                      </div>
                      <span className="text-gray-700 font-medium">→</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => {
                          setSelectedPaymentMethod('upi');
                          setPaymentStep('upi');
                        }}
                        disabled={!isUpiAvailableForAll}
                        className={`w-full py-4 px-6 border rounded-xl flex items-center justify-between ${
                          isUpiAvailableForAll ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <div className="font-semibold">UPI</div>
                            <div className="text-xs text-gray-500">Pay via any UPI app</div>
                          </div>
                        </div>
                        <span className="text-gray-700 font-medium">→</span>
                      </button>
                      {!isUpiAvailableForAll && (
                        <span className="absolute -bottom-5 left-0 text-xs text-red-500">UPI not available for some suppliers</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-4 border-t">
                    <div className="text-right ml-auto">
                      <div className="text-xl font-bold text-green-600">₹{totalPrice}</div>
                      <div className="text-xs text-gray-500">Total Payable</div>
                    </div>
                  </div>
                </>
              )}

              {paymentStep === 'upi' && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">Pay via UPI</h3>
                    <button onClick={() => setPaymentStep('select')} className="text-sm text-gray-500 hover:text-gray-700">← Change</button>
                  </div>

                  <div className="space-y-4">
                    {suppliersInCart.map((s) => (
                      <div key={s.supplierId} className="border rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{s.supplierName}</div>
                            {s.upiId ? (
                              <div className="text-xs text-gray-600">UPI ID: <span className="font-medium">{s.upiId}</span></div>
                            ) : (
                              <div className="text-xs text-red-500">UPI ID not available</div>
                            )}
                          </div>
                          {s.qrCode ? (
                            <button type="button" onClick={() => setQrPreview(getFileUrl(s.qrCode))} className="focus:outline-none">
                              <img src={getFileUrl(s.qrCode)} alt="UPI QR" className="w-20 h-20 object-contain rounded-md border bg-white hover:shadow" />
                            </button>
                          ) : (
                            <div className="w-20 h-20 flex items-center justify-center text-xs text-gray-500 bg-white border rounded-md">No QR</div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Your UPI ID (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., username@upi"
                        value={payerUpiId}
                        onChange={(e) => setPayerUpiId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <label className="text-sm font-medium text-gray-700">UPI Transaction ID</label>
                      <input
                        type="text"
                        placeholder="e.g., UPI txn/reference ID"
                        value={upiTxnId}
                        onChange={(e) => setUpiTxnId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="text-xs text-gray-500">Complete payment in your UPI app, then enter the transaction/reference ID and confirm.</div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          setConfirmingPayment(true);
                          await processOrder('upi');
                        } finally {
                          setConfirmingPayment(false);
                        }
                      }}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-60"
                      disabled={!isUpiAvailableForAll || confirmingPayment}
                    >
                      {confirmingPayment ? 'Confirming…' : 'I have completed UPI payment'}
                    </button>
                  </div>
                </>
              )}

              {paymentStep === 'cod' && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">Cash on Delivery</h3>
                    <button onClick={() => setPaymentStep('select')} className="text-sm text-gray-500 hover:text-gray-700">← Change</button>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">Pay at delivery/pickup</div>
                          <div className="text-xs text-gray-600">No online payment required now</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">₹{totalPrice}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => processOrder('cod')}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                    >
                      Place Order (COD)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {qrPreview && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setQrPreview('')}>
          <div className="bg-white rounded-lg p-2 max-w-full" onClick={(e) => e.stopPropagation()}>
            <img src={qrPreview} alt="UPI QR Preview" className="max-h-[80vh] max-w-[90vw] object-contain" />
            <div className="text-center mt-2">
              <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={() => setQrPreview('')}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-green-50 sticky top-0 z-10">
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-lg transition-all ${activeTab === 'cart' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('cart')}
          >
            <FaShoppingCart /> {t('cart')}
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-lg transition-all ${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaClipboardList /> My Orders
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-green-600 text-3xl font-bold focus:outline-none"
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 overflow-y-auto">
        {activeTab === 'cart' && (
          <div className="w-full mx-auto">
            <h2 className="text-3xl font-extrabold mb-8 text-green-700 flex items-center gap-3"><FaShoppingCart className="text-2xl" /> Cart</h2>
            {cartItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-7xl mb-6">🛒</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some items to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-32">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-xl border"
                      />
                      <div className="flex-1 w-full flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-xl font-bold text-gray-900 truncate">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate">{item.supplier}</div>
                          <div className="text-lg font-bold text-green-600 mt-2">₹{item.price}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition ${
                              item.quantity <= 1 
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-gray-200 hover:bg-gray-300 text-green-700"
                            }`}
                          >
                            <FaMinus />
                          </button>
                          <div className="flex flex-col items-center">
                            <span className="w-16 text-center font-bold text-lg">{item.quantity}</span>
                            <span className="text-xs text-gray-500">/{item.inStock ?? item.stockQty ?? 0} available</span>
                          </div>
                          <button
                            onClick={() => {
                              const available = Number(item.inStock ?? item.stockQty ?? 0);
                              if (available > 0 && item.quantity >= available) {
                                alert(`${item.name}: only ${available} ${item.unit || ''} available.`);
                                return;
                              }
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }}
                            disabled={isAtMax(item)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 text-green-800 text-xl transition"
                          >
                            <FaPlus />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xl transition ml-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Sticky Checkout Bar */}
                <div className="fixed bottom-0 left-0 w-full flex justify-center bg-white border-t py-6 z-20">
                  <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                    <div className="text-2xl font-bold text-gray-800">Total:</div>
                    <div className="text-3xl font-extrabold text-green-600">₹{totalPrice}</div>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full md:w-64 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md transition disabled:opacity-50"
                      disabled={cartItems.length === 0 || loading || cartItems.some(i => Number(i.quantity) > Number(i.inStock ?? i.stockQty ?? 0))}
                      title={cartItems.some(i => Number(i.quantity) > Number(i.inStock ?? i.stockQty ?? 0)) ? "Reduce quantities to match supplier stock" : undefined}
                    >
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="w-full mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold text-green-700 flex items-center gap-3">
                <FaClipboardList className="text-2xl" /> My Orders
              </h2>
              {userOrders.length > 0 && (
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all"
                  title={`Sort by ${sortOrder === 'desc' ? 'Oldest First' : 'Latest First'}`}
                >
                  <FaSort />
                  {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                </button>
              )}
            </div>
            {ordersLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-7xl mb-6">📦</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                <p className="text-gray-500">Your orders will appear here after checkout.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedOrders.map((order, idx) => (
                  <div key={order._id} className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{getOrderNumber(order)}</h3>
                        <p className="text-sm text-gray-500">
                          Placed on: {new Date(order.orderedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">₹{order.totalPrice}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-800">
                                {productDetails[item.productId]?.name || `Loading product...`}
                              </div>
                              <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                              {productDetails[item.productId]?.error && (
                                <div className="text-xs text-red-500">Product details unavailable</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-800">₹{item.unitPrice}</div>
                              <div className="text-sm text-gray-500">Unit Price</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Delivery Type: </span>
                          <span className="font-medium capitalize">{order.deliveryType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Updated: </span>
                          <span className="font-medium">
                            {new Date(order.updatedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartOrdersModal;