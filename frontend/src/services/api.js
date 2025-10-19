const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    mode: 'cors', // Explicitly set CORS mode
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

// Helper function for public API calls (no auth required)
const publicApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    mode: 'cors', // Explicitly set CORS mode
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Public API Call Error:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Get current user info
  getCurrentUser: async () => {
    return apiCall("/auth/me");
  },
};

// Product API calls
export const productAPI = {
  // Get all products (try with auth first, fallback to public)
  getProducts: async () => {
    try {
      const token = localStorage.getItem("authToken");

      // If user is authenticated, use the authenticated endpoint
      if (token) {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(
          `${API_BASE_URL}/prod/get-product`,
          {
            method: "GET",
            headers: headers,
            mode: 'cors',
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      }

      // For non-authenticated users or if auth fails, use public endpoint
      const response = await fetch(
        `${API_BASE_URL}/prod/public/get-products`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: 'cors',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get current supplier's products (authenticated)
  getMyProducts: async () => {
    try {
      const token = tokenManager.getToken ? tokenManager.getToken() : localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/prod/my-products`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
      });

      if (!response.ok) {
        // Try to provide clearer message for 401
        if (response.status === 401) {
          throw new Error('Authentication failed (401)');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize response shape: backend may return { products: [...] } or [...] directly
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.products)) return data.products;
      if (Array.isArray(data.data)) return data.data;

      // If the returned object has items under other keys, attempt to find an array
      for (const key of Object.keys(data || {})) {
        if (Array.isArray(data[key])) return data[key];
      }

      // If nothing looks like an array, return empty array (caller will handle messaging)
      return [];
    } catch (error) {
      console.error('Error fetching my products:', error);
      throw error;
    }
  },

  // Get products by supplier ID (with security check)
  getProductsBySupplierId: async (supplierId) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/prod/supplier/${supplierId}`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products by supplier:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/prod/get-product/${productId}`, {
        method: 'GET',
        headers: headers,
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },
};

// Order API calls
export const orderAPI = {
  // Place a new order
  placeOrder: async (orderData) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/place-order`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(orderData),
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },

  // Get vendor orders
  getVendorOrders: async (vendorId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/vendor/${vendorId}`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
      throw error;
    }
  },

  // Get current supplier's orders (authenticated)
  getMyOrders: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `${API_BASE_URL}/orders/my-orders`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching my orders:", error);
      throw error;
    }
  },

  // Get current supplier's orders by status (authenticated)
  getMyOrdersByStatus: async (status) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `${API_BASE_URL}/orders/my-orders/${status}`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching my orders by status:", error);
      throw error;
    }
  },

  // Get supplier orders (with security check)
  getSupplierOrders: async (supplierId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/supplier/${supplierId}`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching supplier orders:", error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ status }),
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  getVerifiedSuppliers: async () => {
    return apiCall('/auth/suppliers');
  },

  // Get total order count (filtered by supplier if supplier role)
  getTotalOrderCount: async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/total-orders`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching total order count:", error);
      throw error;
    }
  },

  // Get pending order count (filtered by supplier if supplier role)
  getPendingOrderCount: async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/orders/pending-orders`,
        {
          method: "GET",
          headers: headers,
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pending order count:", error);
      throw error;
    }
  },

};

// Token management
export const tokenManager = {
  // store token; if persist === true, also mark session persistence
  setToken: (token, persist = false) => {
    localStorage.setItem("authToken", token);
    if (persist) {
      localStorage.setItem("persistAuth", "1");
    } else {
      localStorage.removeItem("persistAuth");
    }
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
    // don't automatically clear persist here; explicit clearPersist used on logout
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  // persistence helpers
  isPersisted: () => {
    return localStorage.getItem("persistAuth") === "1";
  },
  clearPersist: () => {
    localStorage.removeItem("persistAuth");
  },

  // user data helpers (used when persisting sessions)
  setUserData: (user) => {
    try {
      localStorage.setItem("authUser", JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist user data', e);
    }
  },

  getUserData: () => {
    try {
      const s = localStorage.getItem("authUser");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      console.warn('Failed to parse stored user data', e);
      return null;
    }
  },

  removeUserData: () => {
    localStorage.removeItem("authUser");
  },
};
