'use client';

import { useEffect, useState, use } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { getBlogPostBySlug } from '@/lib/api';
import { BlogPost } from '@/types';
import { Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBlogPostBySlug(slug).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [slug]);

  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-cairo">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {isRtl ? 'المقال غير موجود' : 'Article Not Found'}
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
        >
          {isRtl ? 'العودة للمدونة' : 'Back to Blog'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      <button
        onClick={() => router.push('/blog')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors mb-8"
      >
        {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <span>{isRtl ? 'العودة للمدونة' : 'Back to Blog'}</span>
      </button>

      <article className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {post.image_url && (
          <div className="aspect-[21/9] relative bg-slate-50">
            <Image
              src={post.image_url}
              alt={isRtl ? post.title_ar : post.title_en}
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {isRtl ? post.title_ar : post.title_en}
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-slate-600 leading-relaxed">
            {(isRtl ? post.content_ar : post.content_en).split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
