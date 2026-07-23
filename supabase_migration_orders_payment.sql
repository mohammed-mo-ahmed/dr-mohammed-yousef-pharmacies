-- Add payment_method and payment_status columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';

-- Update existing orders to have default payment values
UPDATE orders SET payment_method = 'cod', payment_status = 'unpaid' WHERE payment_method IS NULL;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  image_url TEXT,
  author TEXT DEFAULT 'Dr. Mohammed Yousef Pharmacies',
  slug TEXT UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Blog posts are manageable by admins"
  ON blog_posts FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Seed a sample blog post
INSERT INTO blog_posts (title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, slug, published_at, image_url)
VALUES
  (
    'نصائح مهمة لتقوية المناعة في فصل الشتاء',
    'Important Tips to Boost Immunity in Winter',
    'تعرف على أفضل الطرق الطبيعية لتقوية جهازك المناعي خلال فصل الشتاء والوقاية من الأمراض الموسمية.',
    'Discover the best natural ways to boost your immune system during winter and prevent seasonal illnesses.',
    'مع قدوم فصل الشتاء تزداد فرص الإصابة بنزلات البرد والإنفلونزا. لذلك من المهم تعزيز جهازك المناعي بطرق طبيعية:\n\n١. تناول فيتامين C الموجود في الحمضيات مثل البرتقال والليمون.\n٢. الحصول على قسط كافٍ من النوم (7-8 ساعات يومياً).\n٣. شرب السوائل الدافئة مثل الأعشاب الطبيعية.\n٤. ممارسة الرياضة بانتظام حتى في المنزل.\n٥. تناول الأطعمة الغنية بالزنك مثل المكسرات والبقوليات.\n\nاحرص دائماً على استشارة الصيدلي قبل تناول أي مكملات غذائية.',
    'With winter approaching, the chances of catching cold and flu increase. It is therefore important to strengthen your immune system naturally:\n\n1. Take Vitamin C found in citrus fruits like oranges and lemons.\n2. Get enough sleep (7-8 hours daily).\n3. Drink warm fluids like herbal teas.\n4. Exercise regularly even at home.\n5. Eat zinc-rich foods like nuts and legumes.\n\nAlways consult your pharmacist before taking any supplements.',
    'boost-immunity-winter',
    NOW(),
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60'
  ),
  (
    'دليلك الشامل لاختيار واقي الشمس المناسب',
    'Complete Guide to Choosing the Right Sunscreen',
    'كل ما تحتاج معرفته عن أنواع واقيات الشمس وكيفية اختيار الأنسب لنوع بشرتك.',
    'Everything you need to know about sunscreen types and how to choose the right one for your skin type.',
    'اختيار واقي الشمس المناسب خطوة أساسية للعناية بالبشرة. إليك دليل شامل:\n\n١. عامل الحماية SPF: يفضل استخدام SPF 30 على الأقل.\n٢. واقي الشمس الفيزيائي: يحتوي على أكسيد الزنك أو ثاني أكسيد التيتانيوم.\n٣. واقي الشمس الكيميائي: يمتص الأشعة فوق البنفسجية.\n٤. للبشرة الدهنية: اختار واقي شمس خالي من الزيوت.\n٥. للبشرة الجافة: اختار واقي شمس بتركيبة مرطبة.\n\nتذكر وضع واقي الشمس قبل 15-30 دقيقة من التعرض للشمس.',
    'Choosing the right sunscreen is an essential skin care step. Here is a comprehensive guide:\n\n1. SPF: Use at least SPF 30.\n2. Physical sunscreen: Contains zinc oxide or titanium dioxide.\n3. Chemical sunscreen: Absorbs UV rays.\n4. For oily skin: Choose an oil-free sunscreen.\n5. For dry skin: Choose a moisturizing sunscreen.\n\nRemember to apply sunscreen 15-30 minutes before sun exposure.',
    'sunscreen-guide',
    NOW(),
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop&q=60'
  );
