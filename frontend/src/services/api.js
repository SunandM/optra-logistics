import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create axios instance with JWT interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Store token and user data
    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  forgotPassword: async (email, phone, deliveryMethod) => {
    const response = await api.post('/auth/forgot-password', { 
      email: email || null, 
      phone: phone || null, 
      delivery_method: deliveryMethod 
    });
    return response.data;
  },

  verifyOTP: async (email, phone, otpCode) => {
    const response = await api.post('/auth/verify-otp', { 
      email: email || null, 
      phone: phone || null, 
      otp_code: otpCode 
    });
    return response.data;
  },

  resetPassword: async (email, phone, otpCode, newPassword) => {
    const response = await api.post('/auth/reset-password', { 
      email: email || null, 
      phone: phone || null, 
      otp_code: otpCode, 
      new_password: newPassword 
    });
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await api.get('/auth/active-sessions');
    return response.data;
  },
};

// User Management API
export const usersAPI = {
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  changeMyPassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// User Requests API
export const requestsAPI = {
  getRequests: async () => {
    const response = await api.get('/requests/');
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await api.post('/requests/', requestData);
    return response.data;
  },

  updateRequest: async (requestId, status) => {
    const response = await api.put(`/requests/${requestId}`, { status });
    return response.data;
  },
};

// Existing API endpoints (updated with JWT)
export const getDrivers = () => api.get('/drivers/');
export const createDriver = (driverData) => api.post('/drivers/', driverData);
export const getVehicles = () => api.get('/vehicles/');
export const createVehicle = (vehicleData) => api.post('/vehicles/', vehicleData);
export const getOrders = () => api.get('/orders/');
export const getPendingOrders = () => api.get('/orders/pending/');
export const createOrder = (orderData) => api.post('/orders/', orderData);
export const optimizeRoute = (optimizationData) => api.post('/optimize/', optimizationData);
export const healthCheck = () => api.get('/health');

export default api;
