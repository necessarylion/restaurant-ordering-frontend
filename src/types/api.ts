// API request and response types

import type {
  User,
  BookingStatus,
  OrderStatus,
  OrderType,
  Role,
} from "./models";

// Auth API types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
}

// Restaurant API types
export interface CreateRestaurantInput {
  name: string;
  address?: string;
  phone?: string;
  currency?: string;
  logo?: File;
}

export interface UpdateRestaurantInput {
  name: string;
  address?: string;
  phone?: string;
  currency?: string;
  logo?: File;
}

// Category API types
export interface CreateCategoryInput {
  name: string;
  sort_order?: number;
  image?: File;
}

export interface UpdateCategoryInput {
  name: string;
  sort_order?: number;
  is_active: boolean;
  image?: File;
}

// Menu Item API types
export interface CreateMenuItemInput {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  images?: File[];
}

export interface UpdateMenuItemInput {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  images?: File[];
}

// Zone API types
export interface CreateZoneInput {
  name: string;
  color?: string;
}

export interface UpdateZoneInput {
  name: string;
  color?: string;
}

// Table API types
export interface CreateTableInput {
  table_number: string;
  seats?: number;
  zone_id?: number;
  position_x?: number;
  position_y?: number;
}

export interface UpdateTableInput {
  table_number: string;
  is_active: boolean;
  seats?: number;
  zone_id?: number;
  position_x?: number;
  position_y?: number;
}

// Floor Plan API types
export interface FloorPlanTableInput {
  id: number;
  x: number;
  y: number;
}

export interface FloorPlanInput {
  tables: FloorPlanTableInput[];
}

// Booking API types
export interface CreateBookingInput {
  table_id: number;
  customer_name: string;
  booking_date_time: string;
  phone?: string;
  notes?: string;
}

export interface UpdateBookingInput {
  table_id: number;
  customer_name: string;
  booking_date_time: string;
  status: BookingStatus;
  phone?: string;
  notes?: string;
}

// Order API types
export interface OrderItemInput {
  menu_item_id: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderInput {
  order_type: OrderType;
  table_id?: number;
  items: OrderItemInput[];
}

export interface UpdateOrderInput {
  order_type: OrderType;
  status: OrderStatus;
  table_id?: number;
  items: OrderItemInput[];
}

// Payment API types
export interface CreatePaymentInput {
  table_id: number;
  order_ids?: number[]; // if empty, all unpaid orders for table
  sub_total: number;
  tax: number;
  discount?: number;
  total: number;
}

// Member API types
export interface InviteMemberInput {
  email: string;
  role: Role;
}

export interface UpdateMemberRoleInput {
  role: Role;
}

// Generic response types
export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

// API error type
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  field?: string;
}

// Pagination types (for future use)
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
