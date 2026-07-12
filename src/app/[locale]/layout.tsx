import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Cairo, Outfit } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: {
      default: isAr ? 'صيدليات د. محمد يوسف' : 'Dr. Mohammed Yousef Pharmacies',
      template: isAr ? '%s | صيدليات د. محمد يوسف' : '%s | Dr. Mohammed Yousef Pharmacies',
    },
    description: isAr
      ? 'مجموعة صيدليات د. محمد يوسف لتقديم خدمة طبية ورعاية صحية تثق بها في مصر وتوصيل سريع للأدوية ومستحضرات التجميل.'
      : 'Dr. Mohammed Yousef Pharmacies providing trusted healthcare services and fast delivery of medicines and cosmetics in Egypt.',
    icons: { icon: '/favicon.ico' },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Set the locale for server-side APIs
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const isRtl = locale === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${outfit.variable} h-full`}
    >
      <body
        className={`min-h-full flex flex-col font-sans ${
          isRtl ? 'font-cairo' : 'font-outfit'
        } bg-white antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
          <CartProvider>
          <WishlistProvider>
            {/* Navbar is fixed at the top (height 80px / 5rem) */}
            <Navbar />
            
            {/* Main content wrapper with padding top to account for the fixed navbar */}
            <main className="flex-grow pt-20">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
          </WishlistProvider>
          </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
