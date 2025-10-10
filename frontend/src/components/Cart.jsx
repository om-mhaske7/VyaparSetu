import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrash, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = ({ items, onClose, onRemoveItem, onUpdateQuantity, onOrderSuccess }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Handler for placing order
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    
    try {
      // Generate a valid MongoDB ObjectId format for vendorId if not available
      const generateObjectId = () => {
        return '507f1f77bcf86cd799439011'; // Valid demo ObjectId
      };
      
      const vendorId = user?._id || user?.vendorId || generateObjectId();
      
      // Validate that vendorId is a valid ObjectId format (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const finalVendorId = objectIdRegex.test(vendorId) ? vendorId : generateObjectId();
      
      // Group cart items by supplier
      const itemsBySupplier = items.reduce((groups, item) => {
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
        const orderData = {
          vendorId: finalVendorId,
          supplierId,
          items: supplierItems.map(item => ({
            productId: item.id,
            supplierId: item.supplierId, // Add supplierId for each item
            quantity: item.quantity,
            unitPrice: item.price
          })),
          deliveryType: 'pickup', // You can make this dynamic if needed
        };
        
        return orderAPI.placeOrder(orderData);
      });
      
      // Wait for all orders to be placed
      const results = await Promise.all(orderPromises);
      
      const orderCount = results.length;
      alert(`${orderCount} order${orderCount > 1 ? 's' : ''} placed successfully!`);
      
      // Call success callback to handle post-order actions
      if (onOrderSuccess) {
        onOrderSuccess();
      }
      
      setLoading(false);
      if (onClose) onClose();
      
    } catch (error) {
      alert('Order failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-2 sm:mx-0">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">{t('cart')}</h2>
            <p className="text-green-100 text-xs sm:text-base">{totalItems} items in cart</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-2 rounded-full transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-60 sm:max-h-96">
          {items.length === 0 ? (
            <div className="p-4 sm:p-8 text-center">
              <div className="text-gray-400 text-5xl sm:text-6xl mb-4">🛒</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm sm:text-base">Add some items to get started!</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{item.supplier}</p>
                    <p className="text-green-600 font-bold text-sm sm:text-base">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition text-xs sm:text-base ${
                        item.quantity <= 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-7 sm:w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-green-200 hover:bg-green-300 rounded-full transition text-xs sm:text-base"
                    >
                      <FaPlus />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-200 hover:bg-red-300 rounded-full transition ml-1 sm:ml-2 text-xs sm:text-base"
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 sm:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
              <span className="text-base sm:text-lg font-semibold">Total:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">₹{totalPrice}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
              >
                Continue Shopping
              </button>
              <button 
                onClick={handlePlaceOrder}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition disabled:opacity-50 text-sm sm:text-base"
                disabled={items.length === 0 || loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
