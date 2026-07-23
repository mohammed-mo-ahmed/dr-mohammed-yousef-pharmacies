'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/types';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function BlogPage() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      <div className="text-center mb-12">
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {isRtl ? 'المدونة' : 'Blog'}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {isRtl ? 'المقالات والأخبار' : 'Articles & News'}
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          {isRtl ? 'نصائح طبية ومقالات صحية من فريق صيدليات د. محمد يوسف' : 'Medical tips and health articles from Dr. Mohammed Yousef Pharmacies team'}
        </p>
        <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full" />
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <ArrowLeft size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {isRtl ? 'قريباً...' : 'Coming Soon...'}
          </h2>
          <p className="text-sm text-slate-500">
            {isRtl
              ? 'سيتم إضافة المقالات قريباً. تابعونا!'
              : 'Articles will be added soon. Stay tuned!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[16/9] relative bg-slate-50 overflow-hidden">
                {post.image_url && (
                  <Image
                    src={post.image_url}
                    alt={isRtl ? post.title_ar : post.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">
                  {isRtl ? post.title_ar : post.title_en}
                </h2>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                  {isRtl ? post.excerpt_ar : post.excerpt_en}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={14} />
                    {post.author}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
