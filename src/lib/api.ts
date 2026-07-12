import { supabase } from './supabase';
import { Product, Category, Order, Customer, Offer } from '@/types';

// ==========================================
// CATEGORIES CRUD
// ==========================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_en', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  return data;
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return null;
  }
  return data;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }
  return true;
}

// ==========================================
// PRODUCTS CRUD
// ==========================================

export type PaginatedProducts = {
  products: Product[];
  total: number;
};

export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  sort?: string;
  isLatest?: boolean;
  isBestSeller?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedProducts> {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('products').select('*, categories(*)', { count: 'exact' });

  if (filters?.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.isLatest) {
    query = query.eq('is_latest', true);
  }

  if (filters?.isBestSeller) {
    query = query.eq('is_best_seller', true);
  }

  if (filters?.search) {
    const safe = filters.search.replace(/[%_]/g, '\\$&');
    query = query.or(`name_ar.ilike.%${safe}%,name_en.ilike.%${safe}%,barcode.ilike.%${safe}%`);
  }

  if (filters?.sort) {
    if (filters.sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (filters.sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (filters.sort === 'name-asc') {
      query = query.order('name_en', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  const products = (data || []).map((prod: Record<string, unknown>) => ({
    ...prod,
    category: (prod as { categories?: unknown }).categories,
  })) as Product[];

  return { products, total: count ?? 0 };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }

  if (data) {
    return {
      ...data,
      category: data.categories,
    };
  }

  return null;
}

export async function createProduct(product: Omit<Product, 'id' | 'category'>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  // Remove category object if passed to avoid insert errors
  const { category: _cat, ...cleanProduct } = product;

  const { data, error } = await supabase
    .from('products')
    .update(cleanProduct)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }
  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  return true;
}

// ==========================================
// OFFERS CRUD
// ==========================================

export async function getOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
  return data || [];
}

export async function createOffer(offer: Omit<Offer, 'id'>): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .insert([offer])
    .select()
    .single();

  if (error) {
    console.error('Error creating offer:', error);
    return null;
  }
  return data;
}

export async function updateOffer(id: string, offer: Partial<Offer>): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .update(offer)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating offer:', error);
    return null;
  }
  return data;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting offer:', error);
    return false;
  }
  return true;
}

// ==========================================
// CUSTOMERS CRUD
// ==========================================

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data || [];
}

export async function createOrUpdateCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer | null> {
  // Try to find customer by phone
  const { data: existing, error: findError } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', customer.phone)
    .maybeSingle();

  if (findError) {
    console.error('Error checking existing customer:', findError);
  }

  if (existing) {
    // Update existing customer — only update fields that have values
    const updates: Record<string, string> = {};
    if (customer.name) updates.name = customer.name;
    if (customer.address) updates.address = customer.address;
    if (customer.email) updates.email = customer.email;

    if (Object.keys(updates).length === 0) return existing;

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) console.error('Error updating customer:', error);
    return data;
  } else {
    // Insert new customer
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();

    if (error) console.error('Error inserting customer:', error);
    return data;
  }
}

// ==========================================
// ORDERS CRUD
// ==========================================

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []).map((ord: Record<string, unknown>) => ({
    ...ord,
    order_items: ((ord as { order_items?: Array<Record<string, unknown>> }).order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      product: (item as { products?: unknown }).products,
    })),
  })) as Order[];
}

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at' | 'status' | 'order_items'>,
  items: { product_id: string; quantity: number; price: number }[]
): Promise<Order | null> {
  // 1. Insert into orders table
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        notes: order.notes,
        delivery_method: order.delivery_method,
        status: 'pending',
        total: order.total,
      },
    ])
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError);
    return null;
  }

  // 2. Insert items into order_items table
  const itemsToInsert = items.map((item) => ({
    order_id: newOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

  if (itemsError) {
    console.error('Error inserting order items:', itemsError);
    // Cleanup order if items fail
    await supabase.from('orders').delete().eq('id', newOrder.id);
    return null;
  }

  // 3. Update Inventory Stock (guard-based to prevent overselling)
  // NOTE: For full atomicity, create a Postgres function and call it via
  // supabase.rpc('decrement_stock', { pid, qty }) — see db/migrations/.
  for (const item of items) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single();

    if (prod && prod.stock >= item.quantity) {
      const newStock = prod.stock - item.quantity;
      // The .gte('stock', ...) filter ensures the update only applies if
      // stock hasn't changed since we read it (race-condition safety).
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product_id)
        .gte('stock', item.quantity);

      if (stockError) {
        console.error('Error updating stock for product', item.product_id, stockError);
      }
    }
  }

  // Create customer
  await createOrUpdateCustomer({
    name: order.customer_name,
    phone: order.customer_phone,
    address: order.customer_address,
    email: '',
  });

  return newOrder;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  // Verify the caller is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Unauthorized attempt to update order status');
    return null;
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }
  return data;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    return false;
  }
  return true;
}

// ==========================================
// WISHLIST CRUD
// ==========================================

export async function getWishlist(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return (data || [])
    .map((item: Record<string, unknown>) => {
      const products = item.products as Record<string, unknown> | null;
      if (!products) return null;
      return {
        ...products,
        category: products.categories,
      } as Product;
    })
    .filter(Boolean) as Product[];
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('wishlists')
    .insert([{ user_id: userId, product_id: productId }]);

  if (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
  return true;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
  return true;
}

export async function getWishlistIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist IDs:', error);
    return new Set();
  }

  return new Set((data || []).map((item: { product_id: string }) => item.product_id));
}

// ==========================================
// DATABASE SEEDER (inserts sample data if empty)
// ==========================================

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Check if categories already exist
    const { data: existingCats } = await supabase.from('categories').select('id');
    if (existingCats && existingCats.length > 0) {
      return { success: false, message: 'Database already has data. Seeding aborted.' };
    }

    // 2. Insert Categories
    const categoriesToInsert = [
      { name_ar: 'الأدوية والوصفات الطبية', name_en: 'Medicines & Rx', slug: 'medicines' },
      { name_ar: 'مستحضرات التجميل والعناية بالبشرة', name_en: 'Cosmetics & Skin Care', slug: 'cosmetics' },
      { name_ar: 'العناية بالطفل', name_en: 'Baby Care', slug: 'baby-care' },
      { name_ar: 'الصحة العامة والفيتامينات', name_en: 'Wellness & Vitamins', slug: 'wellness' },
      { name_ar: 'العناية الشخصية', name_en: 'Personal Care', slug: 'personal-care' },
    ];

    const { data: insertedCats, error: catError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();

    if (catError || !insertedCats) {
      throw new Error(`Failed to seed categories: ${catError?.message}`);
    }

    // Map slug to UUID
    const catMap = new Map<string, string>();
    insertedCats.forEach((c: { slug: string; id: string }) => catMap.set(c.slug, c.id));

    // 3. Insert Products
    const productsToInsert = [
      {
        name_ar: 'بنادول إكسترا - 24 قرص',
        name_en: 'Panadol Extra - 24 Tablets',
        price: 45.00,
        description_ar: 'بنادول إكسترا يحتوي على الباراسيتامول والكافيين لتخفيف الآلام الشديدة مثل الصداع وآلام الأسنان وآلام العضلات.',
        description_en: 'Panadol Extra formulated with Paracetamol and Caffeine to relieve tough pain like headaches, toothaches, and muscle pain.',
        usage_instructions_ar: 'قرص إلى قرصين كل 4 إلى 6 ساعات عند الحاجة. لا تتجاوز 8 أقراص في 24 ساعة.',
        usage_instructions_en: 'Take 1 to 2 tablets every 4 to 6 hours as needed. Do not exceed 8 tablets in 24 hours.',
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('medicines'),
        stock: 120,
        is_best_seller: true,
        is_latest: false
      },
      {
        name_ar: 'بيوديرما سبيوم جل رغوي - 200 مل',
        name_en: 'Bioderma Sebium Foaming Gel - 200ml',
        price: 380.00,
        description_ar: 'جل رغوي يومي لتنظيف وتنقية البشرة الدهنية والمختلطة. يقلل من إفراز الدهون ويمنع انسداد المسام.',
        description_en: 'Daily purifying foaming gel for combination and oily skin. Limits sebum secretion and prevents clogged pores.',
        usage_instructions_ar: 'يوضع على بشرة رطبة، يرغى، ثم يشطف جيداً بالماء. يستخدم صباحاً ومساءً.',
        usage_instructions_en: 'Apply on wet skin, work into a lather, rinse well, and dry gently. Use morning and night.',
        image_url: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('cosmetics'),
        stock: 45,
        is_best_seller: true,
        is_latest: true
      },
      {
        name_ar: 'حفاضات بامبرز بيبي دراي - مقاس 4 (60 حفاضة)',
        name_en: 'Pampers Baby-Dry Diapers - Size 4 (60 Diapers)',
        price: 290.00,
        description_ar: 'حفاضات بامبرز بيبي دراي توفر جفافاً وحماية تصل إلى 12 ساعة مع قنوات امتصاص فائقة تمنع التسرب.',
        description_en: 'Pampers Baby-Dry diapers offer up to 12 hours of dry protection with extra absorption channels to prevent leakage.',
        usage_instructions_ar: 'استخدمها لطفلك للحفاظ على جفافه وراحته أثناء النوم أو اللعب.',
        usage_instructions_en: 'Use for your baby to ensure maximum dryness and comfort during sleep or play time.',
        image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('baby-care'),
        stock: 30,
        is_best_seller: false,
        is_latest: false
      },
      {
        name_ar: 'سنتروم مع لوتين - 30 قرص',
        name_en: 'Centrum with Lutein - 30 Tablets',
        price: 520.00,
        description_ar: 'مكمل غذائي متعدد الفيتامينات والمعادن يدعم الصحة العامة، المناعة، طاقة الجسم، وسلامة النظر بفضل اللوتين.',
        description_en: 'Multivitamin and multimineral food supplement supporting general health, immunity, energy levels, and vision with Lutein.',
        usage_instructions_ar: 'تناول قرصاً واحداً يومياً مع الماء، ويفضل مع وجبة الطعام.',
        usage_instructions_en: 'Take one tablet daily with water, preferably with a meal.',
        image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('wellness'),
        stock: 65,
        is_best_seller: true,
        is_latest: false
      },
      {
        name_ar: 'معجون أسنان كولجيت توتال - 75 مل',
        name_en: 'Colgate Total Toothpaste - 75ml',
        price: 65.00,
        description_ar: 'معجون أسنان يوفر حماية متكاملة لمدة 12 ساعة ضد تسوس الأسنان، البلاك، مشاكل اللثة، ورائحة الفم الكريهة.',
        description_en: 'Toothpaste providing 12-hour complete protection against cavities, plaque, gum problems, and bad breath.',
        usage_instructions_ar: 'اغسل أسنانك مرتين يومياً على الأقل لمدة دقيقتين في كل مرة.',
        usage_instructions_en: 'Brush your teeth thoroughly at least twice a day for two minutes.',
        image_url: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('personal-care'),
        stock: 80,
        is_best_seller: false,
        is_latest: true
      },
      {
        name_ar: 'كريم مرطب سيرافي للبشرة الجافة - 177 مل',
        name_en: 'CeraVe Moisturizing Cream - 177ml',
        price: 320.00,
        description_ar: 'كريم مرطب غني بالسيراميد الأساسي وحمض الهيالورونيك، يرطب البشرة بعمق ويعيد بناء حاجزها الواقي.',
        description_en: 'Moisturizing cream enriched with essential ceramides and hyaluronic acid, deeply hydrating and restoring the skin barrier.',
        usage_instructions_ar: 'يوضع بسخاء على بشرة نظيفة وجافة كلما دعت الحاجة أو حسب إرشادات الطبيب.',
        usage_instructions_en: 'Apply liberally to clean, dry skin as often as needed or as directed by a physician.',
        image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('cosmetics'),
        stock: 50,
        is_best_seller: true,
        is_latest: true
      },
      {
        name_ar: 'شراب جافيسكون بنكهة النعناع - 150 مل',
        name_en: 'Gaviscon Liquid Mint Flavour - 150ml',
        price: 95.00,
        description_ar: 'شراب معلق لعلاج أعراض حرقة المعدة وعسر الهضم المرتبط بالارتجاع المريئي، سريع المفعول.',
        description_en: 'Suspension for fast relief of heartburn and acid indigestion associated with gastric reflux.',
        usage_instructions_ar: '10 إلى 20 مل بعد الوجبات وقبل النوم، حتى أربع مرات يومياً.',
        usage_instructions_en: 'Take 10 to 20ml after meals and before bedtime, up to four times a day.',
        image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('medicines'),
        stock: 90,
        is_best_seller: false,
        is_latest: false
      },
      {
        name_ar: 'شامبو موستيلا للأطفال - 200 مل',
        name_en: 'Mustela Gentle Shampoo for Baby - 200ml',
        price: 210.00,
        description_ar: 'شامبو لطيف ومثالي لشعر الطفل الرقيق وفروة رأسه الحساسة منذ اليوم الأول للولادة. لا يسبب الدموع.',
        description_en: 'Gentle shampoo ideal for baby\'s fine, delicate hair and sensitive scalp from birth. Tear-free formula.',
        usage_instructions_ar: 'ضعي كمية صغيرة على شعر رطب، دلكي بلطف، ثم اشطفي بعناية بالماء.',
        usage_instructions_en: 'Apply a small amount to wet hair, massage gently, and rinse carefully with water.',
        image_url: 'https://images.unsplash.com/photo-1615396899839-c99c121888b0?w=500&auto=format&fit=crop&q=60',
        category_id: catMap.get('baby-care'),
        stock: 40,
        is_best_seller: false,
        is_latest: true
      }
    ];

    const { error: prodError } = await supabase.from('products').insert(productsToInsert);
    if (prodError) {
      throw new Error(`Failed to seed products: ${prodError.message}`);
    }

    // 4. Insert Offers
    const offersToInsert = [
      {
        title_ar: 'خصم 30% على منتجات العناية بالبشرة والشعر',
        title_en: '30% Off Skin & Hair Care Products',
        discount_percentage: 30,
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60',
        active: true
      },
      {
        title_ar: 'اشترِ علبتين فيتامينات واحصل على الثالثة مجاناً',
        title_en: 'Buy 2 Vitamin Packs Get 1 Free',
        discount_percentage: 33.3,
        image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=60',
        active: true
      }
    ];

    const { error: offerError } = await supabase.from('offers').insert(offersToInsert);
    if (offerError) {
      throw new Error(`Failed to seed offers: ${offerError.message}`);
    }

    return { success: true, message: 'Database seeded successfully with categories, products, and offers!' };
  } catch (error: unknown) {
    console.error('Seeding database error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown seeding error';
    return { success: false, message: errMsg };
  }
}
