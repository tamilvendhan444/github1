import axios, { AxiosResponse } from 'axios';
import { ApiResponse, LoginCredentials, StudentRegistration } from '@/types';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('userType');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Student auth
  studentLogin: (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/student/login', credentials),
    
  studentRegister: (data: FormData): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/student/register', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  getStudentProfile: (): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/auth/student/profile'),

  // Admin auth
  adminLogin: (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/admin/login', credentials),
    
  getAdminProfile: (): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/auth/admin/profile'),
};

// Menu API calls
export const menuAPI = {
  getMenuItems: (params?: {
    category?: string;
    search?: string;
    isVeg?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/menu', { params }),
    
  getMenuItem: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.get(`/menu/${id}`),
    
  getCategories: (): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/menu/categories'),
    
  createMenuItem: (data: FormData): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/menu', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  updateMenuItem: (id: string, data: FormData): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/menu/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  deleteMenuItem: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/menu/${id}`),
    
  addReview: (id: string, rating: number): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/menu/${id}/review`, { rating }),
};

// Order API calls
export const orderAPI = {
  createOrder: (orderData: {
    items: { menuItemId: string; quantity: number }[];
    specialInstructions?: string;
    paymentMethod?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/orders', orderData),
    
  processPayment: (orderId: string, paymentData: {
    paymentId: string;
    paymentStatus?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/orders/${orderId}/payment`, paymentData),
    
  getStudentOrders: (params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/orders/student', { params }),
    
  getOrder: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.get(`/orders/${id}`),
    
  updateOrderStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/orders/${id}/status`, { status }),
    
  addOrderReview: (id: string, reviewData: {
    rating: number;
    review?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/orders/${id}/review`, reviewData),
};

// Student API calls
export const studentAPI = {
  updateProfile: (data: FormData): Promise<AxiosResponse<ApiResponse>> =>
    api.put('/students/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  getOrders: (params?: {
    status?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/students/orders', { params }),
    
  getStats: (): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/students/stats'),
    
  getReceipt: (orderId: string): Promise<AxiosResponse<ApiResponse>> =>
    api.get(`/students/order/${orderId}/receipt`),
};

// Admin API calls
export const adminAPI = {
  getDashboard: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/admin/dashboard', { params }),
    
  getOrders: (params?: {
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/admin/orders', { params }),
    
  getStudents: (params?: {
    search?: string;
    isVerified?: boolean;
    isActive?: boolean;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/admin/students', { params }),
    
  verifyStudent: (id: string, isVerified: boolean): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/admin/students/${id}/verify`, { isVerified }),
    
  updateStudentStatus: (id: string, isActive: boolean): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/admin/students/${id}/status`, { isActive }),
    
  getAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/admin/analytics', { params }),
};

// QR API calls
export const qrAPI = {
  scanQR: (qrData: {
    qrCode: string;
    scannedBy: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/qr/scan', qrData),
    
  getLogs: (params?: {
    startDate?: string;
    endDate?: string;
    isDuplicate?: boolean;
    isSuccessful?: boolean;
    limit?: number;
    page?: number;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/qr/logs', { params }),
    
  getStats: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/qr/stats', { params }),
};

export default api;