export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  description_ar: string;
  description_en: string;
  usage_instructions_ar: string;
  usage_instructions_en: string;
  image_url: string;
  category_id: string;
  stock: number;
  is_best_seller: boolean;
  is_latest: boolean;
  created_at?: string;
  category?: Category;
  // Drug database fields
  active_ingredients?: string;
  company?: string;
  barcode?: string;
  form?: string;
  size?: string;
  offer_price?: number | null;
  availability?: string;
  drug_category?: string;
  uses_summary_ar?: string;
  uses_summary_en?: string;
  warnings_summary_ar?: string;
  warnings_summary_en?: string;
  warning_high_bp?: boolean;
  warning_diabetes?: boolean;
  warning_pregnancy?: boolean;
  warning_lactation?: boolean;
  warning_kidney?: boolean;
  warning_liver?: boolean;
  warning_heart?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  delivery_method: 'home_delivery' | 'pharmacy_pickup';
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  user_id?: string;
  created_at?: string;
  order_items?: OrderItem[];
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  address?: string;
  gender?: 'male' | 'female';
  age?: number;
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
