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
  category?: Category; // Nested relation
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
  created_at?: string;
  order_items?: OrderItem[];
}

export interface Offer {
  id: string;
  title_ar: string;
  title_en: string;
  discount_percentage: number;
  image_url: string;
  active: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
