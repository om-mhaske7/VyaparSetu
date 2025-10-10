import React, { useState, useMemo } from "react";

const DispatchManagement = ({ orders, handleMarkDispatched }) => {
  const [sortBy, setSortBy] = useState("latest"); // "latest" or "oldest"
  
  const acceptedOrders = orders.filter(order => order.status === "accepted");

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Sort orders based on selected criteria
  const sortedAcceptedOrders = useMemo(() => {
    if (!acceptedOrders || acceptedOrders.length === 0) return [];
    
    // First, assign permanent order numbers based on chronological order of ALL orders (oldest = 1)
    // This ensures consistency with the OrderManagement component
    const allOrdersWithNumbers = orders
      .sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt))
      .map((order, index) => ({
        ...order,
        orderNumber: index + 1
      }));
    
    // Filter to get only accepted orders with their assigned numbers
    const acceptedOrdersWithNumbers = allOrdersWithNumbers.filter(order => order.status === "accepted");
    
    // Then sort for display based on user preference
    if (sortBy === "latest") {
      // Latest: newest first, oldest last (descending order)
      return acceptedOrdersWithNumbers.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
    } else {
      // Oldest: oldest first, newest last (ascending order)
      return acceptedOrdersWithNumbers.sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt));
    }
  }, [orders, acceptedOrders, sortBy]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dispatch Management ({acceptedOrders.length})</h2>
        
        {/* Sort Controls - only show if there are orders */}
        {acceptedOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        )}
      </div>
      
      {acceptedOrders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders ready for dispatch</h3>
            <p className="mt-1 text-sm text-gray-500">Accept orders first to see them here for dispatch.</p>
          </div>
        </div>
      ) : (
        sortedAcceptedOrders.map((order) => (
          <div key={order._id} className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold">
                Order #{order.orderNumber}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs ml-2">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(order.orderedAt)}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Delivery Type:</span> {order.deliveryType === 'pickup' ? 'Pickup' : 'Local Delivery'}
            </div>
            
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Order Items:</div>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    • {item.productName || 'Product name unavailable'} x {item.quantity} - {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="font-semibold">Total: {formatCurrency(order.totalPrice)}</div>
              <button 
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={() => handleMarkDispatched(order._id)}
              >
                Mark Dispatched
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DispatchManagement; 