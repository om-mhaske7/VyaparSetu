import React, { useState, useMemo } from "react";

const OrderManagement = ({ orders, handleAcceptOrder, handleRejectOrder, ordersLoading }) => {
  const [sortBy, setSortBy] = useState("latest"); // "latest" or "oldest"

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
  const sortedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // First, assign permanent order numbers based on chronological order (oldest = 1)
    const ordersWithNumbers = orders
      .sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt))
      .map((order, index) => ({
        ...order,
        orderNumber: index + 1
      }));
    
    // Then sort for display based on user preference
    if (sortBy === "latest") {
      // Latest: newest first, oldest last (descending order)
      return ordersWithNumbers.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
    } else {
      // Oldest: oldest first, newest last (ascending order)
      return ordersWithNumbers.sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt));
    }
  }, [orders, sortBy]);

  if (ordersLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">No orders have been placed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Incoming Orders ({orders.length})</h2>
        
        {/* Sort Controls */}
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
      </div>
      
      {sortedOrders.map((order) => (
        <div key={order._id} className={`border-l-4 p-4 rounded mb-4 ${
          order.status === "pending" ? "bg-yellow-50 border-yellow-400" :
          order.status === "accepted" ? "bg-green-50 border-green-400" :
          order.status === "dispatched" ? "bg-blue-50 border-blue-400" :
          order.status === "delivered" ? "bg-purple-50 border-purple-400" :
          "bg-red-50 border-red-400"
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">
              Order #{order.orderNumber}
              <span className={`px-2 py-1 rounded text-xs ml-2 ${
                order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                order.status === "accepted" ? "bg-green-100 text-green-700" :
                order.status === "dispatched" ? "bg-blue-100 text-blue-700" :
                order.status === "delivered" ? "bg-purple-100 text-purple-700" :
                "bg-red-100 text-red-700"
              }`}>
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
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.productName ? item.productName : 'Product name unavailable'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.productDescription ? item.productDescription : 'No description available'}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">
                        Qty: {item.quantity}
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit Price: {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="text-sm font-semibold">
                        Total: {formatCurrency(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">
                Total Amount: {formatCurrency(order.totalPrice)}
              </div>
              
              {order.status === "pending" && (
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                    onClick={() => handleRejectOrder(order._id)}
                  >
                    Reject
                  </button>
                  <button 
                    className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                    onClick={() => handleAcceptOrder(order._id)}
                  >
                    Accept
                  </button>
                </div>
              )}
              
              {order.status === "accepted" && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Order Accepted - Ready for dispatch
                </div>
              )}
              
              {order.status === "dispatched" && (
                <div className="text-sm text-blue-600 font-medium">
                  🚚 Order Dispatched
                </div>
              )}
              
              {order.status === "delivered" && (
                <div className="text-sm text-purple-600 font-medium">
                  ✅ Order Delivered
                </div>
              )}
              
              {order.status === "rejected" && (
                <div className="text-sm text-red-600 font-medium">
                  ❌ Order Rejected
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderManagement; 