// User Types
export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  isVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super-admin';
  permissions: string[];
  lastLogin: string;
  createdAt: string;
}

// Menu Types
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  rating: number;
  reviewCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order Types
export interface OrderItem {
  menuItem: string | MenuItem;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  student: string | Student;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'upi' | 'gpay' | 'paytm' | 'cash';
  paymentId?: string;
  qrCode?: {
    code: string;
    isUsed: boolean;
    usedAt?: string;
    scannedBy?: string;
  };
  specialInstructions?: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

// Receipt Type
export interface Receipt {
  orderNumber: string;
  orderDate: string;
  student: {
    name: string;
    rollNo: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  paymentId?: string;
  status: string;
  specialInstructions?: string;
  qrCode?: string;
  isQRUsed: boolean;
  qrUsedAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
  totalOrders?: number;
  totalStudents?: number;
  currentPage?: number;
  totalPages?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentRegistration {
  name: string;
  rollNo: string;
  email: string;
  password: string;
  phone: string;
  idCard: File;
}

export interface AuthContextType {
  user: Student | Admin | null;
  userType: 'student' | 'admin' | null;
  token: string | null;
  login: (credentials: LoginCredentials, userType: 'student' | 'admin') => Promise<void>;
  register: (data: StudentRegistration) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Dashboard Stats Types
export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: string;
  };
  orders: {
    pending: number;
    delivered: number;
    cancelled: number;
    completionRate: string;
  };
  menu: {
    totalItems: number;
    activeItems: number;
    inactiveItems: number;
  };
  students: {
    averageSpent: string;
    averageOrders: string;
  };
  recentOrders: Order[];
  topSellingItems: {
    _id: string;
    itemName: string;
    totalQuantity: number;
    totalRevenue: number;
    category?: string;
    isVeg?: boolean;
  }[];
  dailySales: {
    _id: {
      year: number;
      month: number;
      day: number;
    };
    totalSales: number;
    orderCount: number;
  }[];
}

// QR Log Types
export interface QRScanAttempt {
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  isSuccessful: boolean;
  isDuplicate: boolean;
  scannedBy: string;
  notes: string;
}

export interface QRLog {
  _id: string;
  orderId: string;
  qrCode: string;
  scanAttempts: QRScanAttempt[];
  isValid: boolean;
  validUntil: string;
  firstScanAt?: string;
  totalScanAttempts: number;
  duplicateScanAttempts: number;
  createdAt: string;
  updatedAt: string;
}