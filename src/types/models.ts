// Domain enums and types

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum OrderType {
  DINE_IN = "dine_in",
  TAKEAWAY = "takeaway",
  DELIVERY = "delivery",
}

export enum Role {
  OWNER = "owner",
  ADMIN = "admin",
  STAFF = "staff",
}

export enum MemberStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

// Core domain models
export interface User {
  id: number;
  email: string;
  name: string;
  max_restaurants: number;
  created_at: string;
  updated_at: string;
  memberships?: RestaurantMember[];
}

export interface Restaurant {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  currency: string; // e.g., "USD", "MMK"
  created_at: string;
  updated_at: string;
  members?: RestaurantMember[];
}

export interface RestaurantMember {
  id: number;
  restaurant_id: number;
  user_id: number | null;
  invitation_email: string;
  role: Role;
  status: MemberStatus;
  invited_by: number;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  user?: User;
  inviter?: User;
}

export interface Category {
  id: number;
  restaurant_id: number;
  name: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

export interface MenuItemImage {
  id: number;
  menu_item_id: number;
  image: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number; // in smallest currency unit (cents)
  is_available: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  category?: Category;
  images?: MenuItemImage[];
}

export interface Table {
  id: number;
  restaurant_id: number;
  table_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  price: number; // price at time of order
  notes: string | null;
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

export interface Order {
  id: number;
  restaurant_id: number;
  user_id: number | null;
  table_id: number | null;
  order_type: OrderType;
  status: OrderStatus;
  total: number;
  payment_id: number | null;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  user?: User;
  table?: Table;
  order_items?: OrderItem[];
  payment?: Payment;
}

export interface Payment {
  id: number;
  restaurant_id: number;
  table_id: number;
  sub_total: number;
  tax: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  table?: Table;
  orders?: Order[];
}

export interface OrderToken {
  id: number;
  restaurant_id: number;
  table_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  table?: Table;
}

// Frontend-specific types
export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
}
