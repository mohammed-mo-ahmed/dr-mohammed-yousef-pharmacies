'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/lib/api';
import { Truck, Store, CreditCard, ShoppingBag, CheckCircle, AlertTriangle, LogIn } from 'lucide-react';
export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { cart, cartTotal, clearCart } = useCart();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/checkout');
      } else {
        setAuthChecked(true);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !authChecked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'pharmacy_pickup'>('home_delivery');

  // Request statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Validation errors
  const [valErrors, setValErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.name = t('checkout.validation.name');
    if (!phone.trim()) errors.phone = t('checkout.validation.phone');
    if (deliveryMethod === 'home_delivery' && !address.trim()) {
      errors.address = t('checkout.validation.address');
    }
    setValErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customer_name: fullName,
        customer_phone: phone,
        customer_address: deliveryMethod === 'home_delivery' ? address : 'Pharmacy Pickup',
        notes: notes,
        delivery_method: deliveryMethod,
        total: cartTotal,
      };

      const orderItemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const newOrder = await createOrder(orderPayload, orderItemsPayload);

      if (newOrder) {
        setOrderSuccess(true);
        clearCart();
      } else {
        setErrorMsg(isRtl ? 'حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.' : 'Error submitting your order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(isRtl ? 'فشل الاتصال بالخادم. يرجى التحقق من الشبكة.' : 'Failed to connect to server. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center font-cairo">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-pulse">
            <CheckCircle size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
            {t('checkout.success')}
          </h1>
          <p className="text-slate-500 text-sm md:text-base mb-8 leading-relaxed">
            {isRtl
              ? 'شكراً لتسوقك معنا! تم إرسال طلبك بنجاح، وسيتواصل معك الصيدلي المسؤول لتأكيد مواعيد التوصيل أو الاستلام.'
              : 'Thank you for shopping with us! Your order has been placed successfully. Our pharmacist will contact you shortly to confirm details.'}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            {isRtl ? 'مواصلة التسوق' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-cairo">
      
      {/* Title */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          {t('checkout.title')}
        </h1>
      </div>

      {cart.length === 0 ? (
        /* Empty Checkout guard */
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {isRtl ? 'لا توجد منتجات لإتمام الشراء!' : 'No products to checkout!'}
          </h2>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold"
          >
            {isRtl ? 'تصفح المنتجات' : 'Browse Products'}
          </button>
        </div>
      ) : (
        /* Checkout Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Checkout Form (Left 2 cols) */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Delivery Methods Options */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">
                {t('checkout.deliveryMethod')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Home Delivery Card */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('home_delivery')}
                  className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all w-full text-left ${
                    deliveryMethod === 'home_delivery'
                      ? 'border-teal-500 bg-teal-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    deliveryMethod === 'home_delivery' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {t('checkout.homeDelivery')}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRtl ? 'توصيل لباب المنزل خلال ساعات' : 'Express home delivery'}
                    </p>
                  </div>
                </button>

                {/* Pharmacy Pickup Card */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pharmacy_pickup')}
                  className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all w-full text-left ${
                    deliveryMethod === 'pharmacy_pickup'
                      ? 'border-teal-500 bg-teal-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    deliveryMethod === 'pharmacy_pickup' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Store size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {t('checkout.pharmacyPickup')}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRtl ? 'استلام فوري من فرع الصيدلية' : 'Instant pickup at the branch'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-base mb-2">
                {isRtl ? 'معلومات المستلم' : 'Recipient Information'}
              </h3>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="checkout-name" className="text-xs font-semibold text-slate-500">{t('checkout.fullName')}</label>
                <input
                  id="checkout-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white text-sm ${
                    valErrors.name ? 'border-rose-400' : 'border-slate-200 focus:border-teal-500'
                  }`}
                  placeholder={isRtl ? 'أدخل اسمك بالكامل' : 'Your full name'}
                />
                {valErrors.name && <span className="text-xs text-rose-500 font-semibold">{valErrors.name}</span>}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="checkout-phone" className="text-xs font-semibold text-slate-500">{t('checkout.phone')}</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white text-sm text-left`}
                  dir="ltr"
                  placeholder={isRtl ? '01xxxxxxxxx' : '01xxxxxxxxx'}
                />
                {valErrors.phone && <span className="text-xs text-rose-500 font-semibold">{valErrors.phone}</span>}
              </div>

              {/* Address (conditional on Home Delivery) */}
              {deliveryMethod === 'home_delivery' && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label htmlFor="checkout-address" className="text-xs font-semibold text-slate-500">{t('checkout.address')}</label>
                  <textarea
                    id="checkout-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white text-sm ${
                      valErrors.address ? 'border-rose-400' : 'border-slate-200 focus:border-teal-500'
                    }`}
                    placeholder={isRtl ? 'المنطقة، الشارع، رقم البناية، الطابق، الشقة' : 'District, Street, Building, Floor, Apartment'}
                  />
                  {valErrors.address && <span className="text-xs text-rose-500 font-semibold">{valErrors.address}</span>}
                </div>
              )}

              {/* Additional Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="checkout-notes" className="text-xs font-semibold text-slate-500">{t('checkout.notes')}</label>
                <textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-sm focus:border-teal-500"
                  placeholder={isRtl ? 'مثال: جرس الباب معطل، أو تفاصيل مبنى معين' : 'E.g. door bell is broken, or building features'}
                />
              </div>

            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-[18px] bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold text-base shadow-md shadow-teal-100 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-teal-200 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>{t('checkout.submit')}</span>
                </>
              )}
            </button>

          </form>

          {/* Cart Summary Panel (Right 1 col) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-teal-600" />
              <span>{isRtl ? 'ملخص العناصر' : 'Items Summary'}</span>
            </h3>

            {/* Items list */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs gap-3">
                  <div className="flex flex-col flex-grow">
                    <span className="font-bold text-slate-800 line-clamp-1">
                      {isRtl ? item.product.name_ar : item.product.name_en}
                    </span>
                    <span className="text-slate-400 mt-0.5">
                      {item.quantity} × {item.product.price.toFixed(2)} {t('common.currency')}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 font-sans">
                    {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{isRtl ? 'سعر المنتجات' : 'Products Total'}</span>
                <span className="font-bold text-slate-800 font-sans">{cartTotal.toFixed(2)} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{isRtl ? 'الشحن والتوصيل' : 'Delivery Charge'}</span>
                <span className="font-bold text-emerald-600">{isRtl ? 'مجاني' : 'Free'}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">{t('cart.total')}</span>
                <div>
                  <span className="text-xl font-black text-teal-600 font-sans">
                    {cartTotal.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 me-1">
                    {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
