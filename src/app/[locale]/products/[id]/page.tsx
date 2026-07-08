'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { getProductById, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight, CornerDownLeft, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const isRtl = locale === 'ar';

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    async function loadProductData() {
      if (!productId) return;
      setLoading(true);
      const prod = await getProductById(productId);
      
      if (prod) {
        setProduct(prod);
        // Fetch related products in same category (excluding current)
        if (prod.category_id) {
          const related = await getProducts({ categoryId: prod.category_id });
          setRelatedProducts(related.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      }
      setLoading(false);
    }
    loadProductData();
  }, [productId]);

  const incrementQty = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Optional: redirect to cart or show success
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-cairo">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {isRtl ? 'المنتج غير موجود' : 'Product Not Found'}
        </h2>
        <p className="text-slate-500 mb-6">
          {isRtl ? 'عذراً، لم نتمكن من العثور على المنتج المطلوب.' : 'Sorry, the product you are looking for could not be found.'}
        </p>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
        >
          {isRtl ? 'العودة لصفحة المنتجات' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="mb-6 flex">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors font-cairo"
        >
          {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>{isRtl ? 'العودة' : 'Back'}</span>
        </button>
      </div>

      {/* Main product display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 md:p-10 border border-slate-100 rounded-3xl shadow-sm mb-16">
        
        {/* Left Side: Product Image */}
        <div className="w-full aspect-square relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
          <Image
            src={imgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
            alt={isRtl ? product.name_ar : product.name_en}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6 md:p-10"
            onError={() => setImgErr(true)}
            priority
          />
        </div>

        {/* Right Side: Info & Actions */}
        <div className={`flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
          <div>
            {/* Category badge */}
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg mb-4 font-cairo">
              {product.category ? (isRtl ? product.category.name_ar : product.category.name_en) : ''}
            </span>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight font-cairo">
              {isRtl ? product.name_ar : product.name_en}
            </h1>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-xs font-semibold text-slate-500 font-cairo">
                {product.stock > 0
                  ? `${isRtl ? 'متوفر في المخزن' : 'In Stock'} (${product.stock})`
                  : (isRtl ? 'نفذت الكمية' : 'Out of Stock')}
              </span>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-black text-teal-600 font-sans">
                {product.price.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500 font-cairo">
                {t('common.currency')}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-sm mb-2 font-cairo">
                {t('products.details')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-cairo">
                {isRtl ? product.description_ar : product.description_en}
              </p>
            </div>

            {/* Usage instructions */}
            {((isRtl ? product.usage_instructions_ar : product.usage_instructions_en)) && (
              <div className="mb-8 p-4 bg-teal-50/50 rounded-2xl border border-teal-50">
                <h3 className="font-bold text-teal-800 text-sm mb-2 flex items-center gap-1.5 font-cairo">
                  <CornerDownLeft size={16} />
                  <span>{t('products.usage')}</span>
                </h3>
                <p className="text-xs md:text-sm text-teal-900 font-cairo leading-relaxed">
                  {isRtl ? product.usage_instructions_ar : product.usage_instructions_en}
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="border-t border-slate-100 pt-6">
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity selector */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-slate-50 w-full sm:w-36">
                  <button
                    onClick={decrementQty}
                    className="p-2 text-slate-500 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-extrabold text-slate-800 font-sans text-base w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    className="p-2 text-slate-500 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-[18px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-100 hover:shadow-lg transition-all font-cairo"
                >
                  <ShoppingBag size={20} />
                  <span>{t('common.addToCart')}</span>
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold font-cairo cursor-not-allowed border border-slate-200"
              >
                {isRtl ? 'غير متوفر حالياً' : 'Currently Unavailable'}
              </button>
            )}

            {/* Quick trust metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 text-slate-400 text-xs font-cairo">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-teal-500" />
                <span>{isRtl ? 'توصيل خلال ساعات' : 'Delivery within hours'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-teal-500" />
                <span>{isRtl ? 'أدوية أصلية 100%' : '100% Genuine Medicine'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-cairo">
              {t('products.related')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <RelatedProductCard
                key={prod.id}
                product={prod}
                isRtl={isRtl}
                t={t}
                onAddToCart={addToCart}
                router={router}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// Internal Related Card component
function RelatedProductCard({
  product,
  isRtl,
  t,
  onAddToCart,
  router,
}: {
  product: Product;
  isRtl: boolean;
  t: (key: string) => string;
  onAddToCart: (p: Product) => void;
  router: { push: (url: string) => void };
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Image container */}
      <div
        className="w-full aspect-square relative bg-slate-50 cursor-pointer overflow-hidden"
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <Image
          src={imgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
          alt={isRtl ? product.name_ar : product.name_en}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgErr(true)}
        />
      </div>

      {/* Content */}
      <div className="p-3.5 flex-grow flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => router.push(`/products/${product.id}`)}
            className="font-bold text-slate-800 text-xs md:text-sm mb-2 font-cairo line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors leading-snug"
          >
            {isRtl ? product.name_ar : product.name_en}
          </h3>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-cairo">{t('common.price')}</span>
            <span className="text-sm font-extrabold text-teal-600 font-sans">
              {product.price.toFixed(2)} <span className="text-[10px] font-bold font-cairo">{t('common.currency')}</span>
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-lg transition-all"
            title={t('common.addToCart')}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
