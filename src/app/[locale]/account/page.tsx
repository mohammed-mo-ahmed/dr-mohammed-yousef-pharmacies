'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { getProfile, upsertProfile } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { User, Lock, LogOut, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function AccountPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getProfile(user.id).then((p) => {
        setProfile(p);
        if (p) {
          setFullName(p.full_name || '');
          setPhone(p.phone || '');
          setAddress(p.address || '');
          setGender(p.gender || '');
          setAge(p.age?.toString() || '');
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const result = await upsertProfile({
      user_id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gender: (gender as 'male' | 'female') || undefined,
      age: age ? parseInt(age) : undefined,
    });

    if (result) {
      setProfile(result);
      setSuccessMsg(t('profileUpdated'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء حفظ البيانات.' : 'Error saving profile.');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg(t('passwordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(t('passwordMin'));
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      setErrorMsg(isRtl ? 'حدث خطأ أثناء تغيير كلمة المرور.' : 'Error changing password.');
    } else {
      setSuccessMsg(t('passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 font-cairo">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <User size={28} className="text-teal-600" />
          {t('title')}
        </h1>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-sm flex items-center gap-2.5 mb-6">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm flex items-center gap-2.5 mb-6">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <h2 className="font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
          <User size={18} className="text-teal-600" />
          {t('personalInfo')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('email')}</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('age')}</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="10"
              max="120"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('gender')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            >
              <option value="">{isRtl ? 'اختر...' : 'Select...'}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-500">{t('address')}</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
        >
          <Save size={16} />
          <span>{saving ? t('loading') : t('updateProfile')}</span>
        </button>
      </div>

      {/* Password Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
        <h2 className="font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
          <Lock size={18} className="text-teal-600" />
          {t('changePassword')}
        </h2>

        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500">{t('confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving || !newPassword || !confirmPassword}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Lock size={16} />
            <span>{saving ? t('loading') : t('updatePassword')}</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold border border-rose-200 transition-all flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        <span>{t('logout')}</span>
      </button>
    </div>
  );
}
