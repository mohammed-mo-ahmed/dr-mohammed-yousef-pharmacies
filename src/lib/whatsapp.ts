const PHONE_NUMBER = '201234567890';

const STATUS_MESSAGES: Record<string, { ar: string; en: string }> = {
  pending: {
    ar: 'تم إرسال طلبك بنجاح. سنقوم بمراجعته قريباً.',
    en: 'Your order has been sent successfully. We will review it shortly.',
  },
  under_review: {
    ar: 'طلبك قيد المراجعة حالياً.',
    en: 'Your order is currently under review.',
  },
  approved: {
    ar: 'تم قبول طلبك وسيتم تجهيزه قريباً.',
    en: 'Your order has been approved and will be processed soon.',
  },
  awaiting_payment: {
    ar: 'طلبك بانتظار الدفع. يرجى تحويل المبلغ عبر InstaPay أو التحويل البنكي والتواصل معنا لتأكيد الدفع.',
    en: 'Your order is awaiting payment. Please transfer via InstaPay or bank transfer and contact us to confirm.',
  },
  paid: {
    ar: 'تم استلام الدفع بنجاح. سيبدأ تجهيز طلبك قريباً.',
    en: 'Payment received successfully. Your order will be processed soon.',
  },
  processing: {
    ar: 'جاري تجهيز طلبك حالياً.',
    en: 'Your order is being processed.',
  },
  ready_for_pickup: {
    ar: 'طلبك جاهز للاستلام من الصيدلية.',
    en: 'Your order is ready for pickup at the pharmacy.',
  },
  out_for_delivery: {
    ar: 'خرج طلبك للتوصيل. يرجى الاستعداد لاستلامه.',
    en: 'Your order is out for delivery. Please get ready to receive it.',
  },
  delivered: {
    ar: 'تم تسليم طلبك بنجاح. شكراً لتسوقك معنا!',
    en: 'Your order has been delivered successfully. Thank you for shopping with us!',
  },
  cancelled: {
    ar: 'تم إلغاء طلبك.',
    en: 'Your order has been cancelled.',
  },
};

export function getWhatsAppMessage(status: string, isRtl: boolean, orderTotal?: number): string {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return '';

  let text = isRtl ? msg.ar : msg.en;
  if (status === 'awaiting_payment' && orderTotal !== undefined) {
    const paymentDetails = isRtl
      ? `\n\nقيمة الطلب: ${orderTotal.toFixed(2)} ج.م\n📱 InstaPay: 01234567890\n🏦 بنك مصر: 123-456-789-0`
      : `\n\nOrder total: ${orderTotal.toFixed(2)} EGP\n📱 InstaPay: 01234567890\n🏦 Bank account: 123-456-789-0`;
    text += paymentDetails;
  }
  return text;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const fullNumber = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}
