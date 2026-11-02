export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type UserRole = 'admin' | 'customer';

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Profile {
  id: string; // matches auth.users(id)
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  user_id: string;
  role: 'admin';
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  tracking_token_hash: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: OrderStatus;
  subtotal: number;
  total: number;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

// Checkout payload types
export interface CheckoutItemPayload {
  product_id: string;
  quantity: number;
}

export interface CreateGuestOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  latitude?: number | null;
  longitude?: number | null;
  items: CheckoutItemPayload[];
  idempotency_key?: string;
  user_id?: string | null;
}

export interface CreateGuestOrderResult {
  order_id: string;
  order_number: string;
  tracking_token: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: 'IDR';
}

export interface UpdateOrderStatusResult {
  order_id: string;
  order_number: string;
  old_status?: OrderStatus;
  status: OrderStatus;
  stock_restored?: boolean;
  message?: string;
}

// Order detail including items and optional history
export interface OrderWithDetails extends Order {
  items: OrderItem[];
  history?: OrderStatusHistory[];
}

// Supabase Database generic schema mapping
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>>;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: AdminProfile;
        Update: Partial<AdminProfile>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      order_status_history: {
        Row: OrderStatusHistory;
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderStatusHistory, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_guest_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_address: string | null;
          p_items: CheckoutItemPayload[];
          p_idempotency_key?: string | null;
          p_user_id?: string | null;
        };
        Returns: CreateGuestOrderResult;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_new_status: OrderStatus;
          p_note?: string | null;
        };
        Returns: UpdateOrderStatusResult;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
