'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import ProductCard from '@/components/ProductCard';
import { getProductById, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight, CornerDownLeft, ShieldCheck, Truck, Heart } from 'lucide-react';
import Image from 'next/image';
import { getProductImage } from '@/lib/productImages';

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
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
          const { products: related } = await getProducts({ categoryId: prod.category_id, limit: 8 });
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
            src={imgErr ? getProductImage(null, product.form) : getProductImage(product.image_url, product.form)}
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

            {/* Drug Info */}
            {(product.company || product.active_ingredients || product.form || product.barcode || product.size) && (
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm mb-3 font-cairo">
                  {isRtl ? 'معلومات الدواء' : 'Drug Information'}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {product.company && (
                    <div>
                      <span className="text-slate-400 font-cairo">{isRtl ? 'الشركة' : 'Company'}:</span>
                      <span className="font-bold text-slate-700 ml-1 font-cairo">{product.company}</span>
                    </div>
                  )}
                  {product.form && (
                    <div>
                      <span className="text-slate-400 font-cairo">{isRtl ? 'الشكل' : 'Form'}:</span>
                      <span className="font-bold text-slate-700 ml-1 font-cairo">{product.form}</span>
                    </div>
                  )}
                  {product.size && (
                    <div>
                      <span className="text-slate-400 font-cairo">{isRtl ? 'الحجم' : 'Size'}:</span>
                      <span className="font-bold text-slate-700 ml-1 font-cairo">{product.size}</span>
                    </div>
                  )}
                  {product.barcode && (
                    <div>
                      <span className="text-slate-400 font-cairo">{isRtl ? 'الباركود' : 'Barcode'}:</span>
                      <span className="font-bold text-slate-700 ml-1 font-mono">{product.barcode}</span>
                    </div>
                  )}
                </div>
                {product.active_ingredients && (
                  <div className="mt-3 text-xs">
                    <span className="text-slate-400 font-cairo">{isRtl ? 'المكونات الفعالة' : 'Active Ingredients'}:</span>
                    <span className="font-bold text-slate-700 ml-1 font-cairo">{product.active_ingredients}</span>
                  </div>
                )}
                {/* Warnings */}
                {(product.warning_pregnancy || product.warning_lactation || product.warning_diabetes || product.warning_high_bp || product.warning_kidney || product.warning_liver || product.warning_heart) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.warning_pregnancy && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'الحمل' : 'Pregnancy'}</span>}
                    {product.warning_lactation && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'الرضاعة' : 'Lactation'}</span>}
                    {product.warning_diabetes && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'السكري' : 'Diabetes'}</span>}
                    {product.warning_high_bp && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'ضغط الدم' : 'High BP'}</span>}
                    {product.warning_kidney && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'الكلى' : 'Kidney'}</span>}
                    {product.warning_liver && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'الكبد' : 'Liver'}</span>}
                    {product.warning_heart && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">{isRtl ? 'القلب' : 'Heart'}</span>}
                  </div>
                )}
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

                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-[18px] rounded-xl border-2 transition-all duration-200 ${
                    isWishlisted(product.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                  aria-label={t('common.wishlist')}
                >
                  <Heart size={20} className={isWishlisted(product.id) ? 'fill-rose-500' : ''} />
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
              <ProductCard
                key={prod.id}
                product={prod}
                isRtl={isRtl}
                t={t}
                onAddToCart={addToCart}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}


