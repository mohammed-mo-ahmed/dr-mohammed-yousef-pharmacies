'use client';

import { Suspense, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, AlertCircle } from 'lucide-react';

function LoginForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRtl = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const nextUrl = searchParams?.get('redirect') || '/';
        router.push(nextUrl);
      }
    }
    checkUser();
  }, [router, searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(
          isRtl
            ? 'خطأ في تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.'
            : 'Login failed. Please check your email and password.'
        );
      } else if (data.session) {
        const nextUrl = searchParams?.get('redirect') || '/';
        router.push(nextUrl);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بقاعدة البيانات.' : 'Connection error with database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center px-4 py-16 bg-slate-50 font-cairo">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-md">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            {isRtl
              ? 'الرجاء إدخال بريدك الإلكتروني وكلمة المرور'
              : 'Please enter your email and password to continue'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs md:text-sm flex items-start gap-2.5 mb-6">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={`w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors ${
                  isRtl ? 'text-right pl-3 pr-10' : 'text-left'
                }`}
              />
              <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isRtl ? 'right-3' : 'left-3'
              }`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors ${
                  isRtl ? 'text-right pl-3 pr-10' : 'text-left'
                }`}
              />
              <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${
                isRtl ? 'right-3' : 'left-3'
              }`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-50 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-teal-200 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>{t('login')}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center"><div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
