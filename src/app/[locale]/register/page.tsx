'use client';

import { Suspense, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

function isPhone(value: string) {
  return /^\+?[0-9]{7,15}$/.test(value.replace(/\s/g, ''));
}

function RegisterForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRtl = locale === 'ar';

  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !identifier.trim() || !password || !confirmPassword) return;

    if (!agreed) {
      setErrorMsg(
        isRtl
          ? 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية.'
          : 'You must agree to the terms of use and privacy policy.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        isRtl
          ? 'كلمتا المرور غير متطابقتين. يرجى المحاولة مرة أخرى.'
          : 'Passwords do not match. Please try again.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        isRtl
          ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const isPhoneInput = isPhone(identifier);
      const emailForAuth = isPhoneInput
        ? `phone_${identifier.replace(/\+/g, '')}@dr-yousef.local`
        : identifier;

      const { data, error } = await supabase.auth.signUp({
        email: emailForAuth,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: isPhoneInput ? identifier.trim() : null,
            display_email: isPhoneInput ? null : identifier.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(
          isRtl
            ? 'حدث خطأ أثناء إنشاء الحساب. قد يكون البريد أو الرقم مسجلاً بالفعل.'
            : 'Error creating account. The email or phone may already be registered.'
        );
      } else if (data.user) {
        setSuccessMsg(
          isRtl
            ? 'تم إنشاء الحساب بنجاح!'
            : 'Account created successfully!'
        );
        setTimeout(() => {
          const nextUrl = searchParams?.get('redirect') || '/';
          router.push(nextUrl);
        }, 1500);
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال بقاعدة البيانات.' : 'Connection error with database.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${searchParams?.get('redirect') || '/'}`,
        },
      });
      if (error) {
        setErrorMsg(
          isRtl
            ? 'حدث خطأ أثناء التسجيل عبر جوجل.'
            : 'Error signing up with Google.'
        );
        setLoading(false);
      }
    } catch {
      setErrorMsg(isRtl ? 'حدث خطأ في الاتصال.' : 'Connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center px-4 py-16 bg-slate-50 font-cairo">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-md">
        
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            <Image
              src={isRtl ? '/images/logos/ar.png' : '/images/logos/en.png'}
              alt="Logo"
              width={80}
              height={80}
              className="block mx-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isRtl ? 'إنشاء حساب جديد' : 'Create Account'}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            {isRtl
              ? 'أدخل بياناتك لإنشاء حساب جديد والبدء في التسوق'
              : 'Enter your details to create a new account and start shopping'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs md:text-sm flex items-start gap-2.5 mb-6">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs md:text-sm flex items-start gap-2.5 mb-6">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isRtl ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone Number'}</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isRtl ? 'email@example.com أو 01xxxxxxxxx' : 'email@example.com or 01xxxxxxxxx'}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'كلمة المرور' : 'Password'}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-550">{isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-500 leading-relaxed">
              {isRtl ? 'أوافق على ' : 'I agree to the '}
              <a href="/terms" target="_blank" className="text-teal-600 font-bold hover:underline">
                {isRtl ? 'شروط الاستخدام' : 'Terms of Use'}
              </a>
              {isRtl ? ' و ' : ' and '}
              <a href="/privacy" target="_blank" className="text-teal-600 font-bold hover:underline">
                {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-50 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-teal-200 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>{t('registerNow')}</span>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-bold">{isRtl ? 'أو' : 'OR'}</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{isRtl ? 'التسجيل عبر جوجل' : 'Sign up with Google'}</span>
        </button>

        <p className="text-center text-xs text-slate-500 mt-6">
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <a href="/login" className="text-teal-600 font-bold hover:underline">
            {t('login')}
          </a>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center"><div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
