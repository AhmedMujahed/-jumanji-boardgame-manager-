export interface User {
  id: string;
  username: string;
  role: 'owner' | 'game_master' | 'admin' | 'employee';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  totalSessions: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  customerId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  hours: number;
  totalCost: number;
  notes?: string;
  gameMasterId: string;
  capacity: number; // Number of people in the session
  genderBreakdown?: {
    male: number;
    female: number;
  };
  tableId: string; // Table ID (not just number)
  tableNumber: number; // Table number (1-50) for display
  createdAt: string;
}

// New interfaces for comprehensive logging
export interface ActivityLog {
  id: string;
  type: 'session_start' | 'session_end' | 'session_edit' | 'session_delete' | 'customer_add' | 'customer_edit' | 'customer_delete' | 'payment_add' | 'payment_edit' | 'payment_delete' | 'game_add' | 'game_edit' | 'game_delete' | 'table_add' | 'table_edit' | 'table_delete' | 'table_refresh' | 'reservation_add' | 'reservation_edit' | 'reservation_delete' | 'user_login' | 'user_logout' | 'system_action';
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionEditData {
  notes?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

// New interfaces for Analytics Dashboard
export interface RevenueData {
  date: string;
  revenue: number;
  sessions: number;
}

export interface CustomerStats {
  id: string;
  name: string;
  totalSessions: number;
  totalSpent: number;
  totalHours: number;
  averageSessionLength: number;
}

// New interfaces for Monthly Tracking
export interface MonthlyMetrics {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  sessions: number;
  hours: number;
  customers: number;
  averageSessionLength: number;
}

export interface MonthlyAnalytics {
  currentMonth: MonthlyMetrics;
  previousMonth: MonthlyMetrics;
  monthlyTrends: MonthlyMetrics[];
  yearToDate: {
    totalRevenue: number;
    totalSessions: number;
    totalHours: number;
    totalCustomers: number;
  };
}

// New interfaces for Game Library
export interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isAvailable: boolean;
  location?: string;
  features: string[];
  // Added fields for better library management
  ageRecommendation?: string; // e.g., "8+", "12+"
  tags?: string[]; // e.g., ['co-op', 'dice']
  copiesAvailable?: number; // inventory tracking
  forSale?: boolean; // available for sale
  price?: number; // price when forSale is true
  createdAt: string;
}

// Enhanced payment interface for mixed payment methods
export interface Payment {
  id: string;
  sessionId: string;
  amount: number;
  method: 'cash' | 'card' | 'online' | 'mixed';
  cashAmount?: number; // Amount paid in cash
  cardAmount?: number; // Amount paid by card
  onlineAmount?: number; // Amount paid online
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  timestamp: string;
}

// New interface for session capacity and gender
export interface SessionCapacity {
  total: number;
  male: number;
  female: number;
  genderType: 'male' | 'female' | 'mixed';
}

// New interfaces for Table Management
export interface Table {
  id: string;
  tableNumber: number; // 1-50
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  capacity: number; // Maximum number of people
  currentSessionId?: string; // ID of active session if occupied
  customerName?: string; // Name of customer using the table
  startTime?: string; // When the current session started
  type: 'standard' | 'premium' | 'vip';
  features: string[];
  location?: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

// Table status types for easier management
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

// Table selection data for forms
export interface TableSelectionData {
  tableId: string;
  tableNumber: number;
  capacity: number;
  type: 'standard' | 'premium' | 'vip';
  status: TableStatus;
}

export interface Reservation {
  id: string;
  tableId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalSessionsManaged: number;
  totalRevenue: number;
  averageRating: number;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface SessionFormData {
  customerId: string;
  notes: string;
  gameMasterId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSessions: number;
  totalRevenue: number;
  totalHours: number;
  averageSessionLength: number;
  topGames: string[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
