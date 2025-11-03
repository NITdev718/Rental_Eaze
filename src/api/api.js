// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (email, password, fullName, phone, location) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone, location }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  // Login user
  login: async (email, password) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  // Get current user
  getMe: async () => {
    return await apiRequest('/api/auth/me');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Items API
export const itemsAPI = {
  // Get all items
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/api/items?${params}`);
  },

  // Get trending items
  getTrending: async () => {
    return await apiRequest('/api/items/trending');
  },

  // Get single item
  getById: async (id) => {
    return await apiRequest(`/api/items/${id}`);
  },

  // Create new item
  create: async (itemData) => {
    return await apiRequest('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  // Update item
  update: async (id, itemData) => {
    return await apiRequest(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  // Delete item
  delete: async (id) => {
    return await apiRequest(`/api/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Increment views
  incrementViews: async (id) => {
    return await apiRequest(`/api/items/${id}/view`, {
      method: 'POST',
    });
  },

  // Get user's items
  getMyItems: async () => {
    return await apiRequest('/api/items/user/my-items');
  },

  // Get favorites
  getFavorites: async () => {
    return await apiRequest('/api/items/user/favorites');
  },

  // Add to favorites
  addFavorite: async (id) => {
    return await apiRequest(`/api/items/${id}/favorite`, {
      method: 'POST',
    });
  },

  // Remove from favorites
  removeFavorite: async (id) => {
    return await apiRequest(`/api/items/${id}/favorite`, {
      method: 'DELETE',
    });
  },
};

// Messages API
export const messagesAPI = {
  // Get all messages
  getAll: async () => {
    return await apiRequest('/api/messages');
  },

  // Send message
  send: async (messageData) => {
    return await apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Mark as read
  markAsRead: async (id) => {
    return await apiRequest(`/api/messages/${id}/read`, {
      method: 'PUT',
    });
  },

  // Delete message
  delete: async (id) => {
    return await apiRequest(`/api/messages/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  // Get user by id
  getById: async (id) => {
    return await apiRequest(`/api/users/${id}`);
  },

  // Update profile
  updateProfile: async (userData) => {
    return await apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};
