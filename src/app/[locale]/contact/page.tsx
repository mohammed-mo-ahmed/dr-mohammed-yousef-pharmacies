'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Phone, Clock, MapPin, Send, MessageSquareCheck } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !msg) return;
    setSuccess(true);
    setName('');
    setEmail('');
    setMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {isRtl ? 'اتصل بنا' : 'Contact Us'}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {isRtl ? 'نحن نسعد بخدمتكم دائماً' : 'We Are Always Happy to Help'}
        </h1>
        <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
        
        {/* Contact Info Cards */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Card 1: Phone */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{t('phone')}</h4>
              <p className="text-slate-600 text-sm font-sans" dir="ltr">
                +20 123 456 7890
              </p>
              <p className="text-slate-600 text-sm font-sans mt-0.5" dir="ltr">
                +20 111 222 3333
              </p>
            </div>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{t('whatsapp')}</h4>
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-100"
              >
                <span>{isRtl ? 'راسلنا على واتساب' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Card 3: Working Hours */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{t('hours')}</h4>
              <p className="text-slate-600 text-sm">{t('hoursValue')}</p>
            </div>
          </div>

          {/* Card 4: Address */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                {isRtl ? 'مقر الصيدلية الرئيسي' : 'Main Pharmacy Branch'}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {isRtl
                  ? 'شارع 9، المعادي، أمام محطة المترو، القاهرة، مصر'
                  : 'Street 9, Maadi, in front of Metro Station, Cairo, Egypt'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">
              {isRtl ? 'أرسل لنا استشارتك أو استفسارك' : 'Send us a message or inquiry'}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm mb-6">
              {isRtl
                ? 'فريق الدعم الطبي والصيدلاني مستعد للرد على جميع تساؤلاتك الدوائية في أسرع وقت.'
                : 'Our pharmacist support team is ready to respond to your queries shortly.'}
            </p>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center flex flex-col items-center gap-3">
                <MessageSquareCheck size={28} className="text-emerald-500" />
                <h4 className="font-bold text-emerald-800">
                  {isRtl ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {isRtl
                    ? 'نشكرك على تواصلك معنا. سنقوم بالرد عليك عبر البريد الإلكتروني أو الهاتف في أقرب وقت.'
                    : 'Thank you for reaching out. We will get back to you via phone or email as soon as possible.'}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                >
                  {isRtl ? 'أرسل رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMsg} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isRtl ? 'أدخل اسمك' : 'Your name'}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRtl ? 'اختياري' : 'Optional'}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors text-left"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">{isRtl ? 'نص الاستفسار' : 'Message Body'}</label>
                  <textarea
                    required
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    rows={4}
                    placeholder={isRtl ? 'اكتب استشارتك الطبية أو تفاصيل طلبك هنا...' : 'Type your medical questions here...'}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto self-end px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send size={14} />
                  <span>{isRtl ? 'إرسال الرسالة' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* 3. Google Map section */}
      <section className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm overflow-hidden">
        <h3 className="font-extrabold text-slate-900 text-base mb-4 px-2">
          {t('location')}
        </h3>
        <div className="w-full h-80 relative rounded-2xl overflow-hidden border border-slate-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13824.288219642646!2d31.25895786847844!3d30.01633519808945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145847e62a11b6ad%3A0xc3f0b2f8319f6a7!2sMaadi%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
}
