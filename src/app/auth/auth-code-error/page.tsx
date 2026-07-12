import { Link } from '@/i18n/routing';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-cairo">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4">
          خطأ في المصادقة
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
