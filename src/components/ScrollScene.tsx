'use client';

import { useEffect, useRef, useState } from 'react';

export interface ScrollOverlay {
  startPercentage: number;
  endPercentage: number;
  subtitleAr?: string;
  subtitleEn?: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  ctaAr?: string;
  ctaEn?: string;
  ctaHref?: string;
  persistAfterEnd?: boolean;
}

interface ScrollSceneProps {
  frameCount: number;
  framePathPattern: (index: number) => string;
  overlays: ScrollOverlay[];
  locale: string;
  navbarHeight?: number;
}

const SCROLL_DISTANCE_VH = 142;

export default function ScrollScene({
  frameCount,
  framePathPattern,
  overlays,
  locale,
  navbarHeight = 80,
}: ScrollSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const allLoadedRef = useRef(false);
  const firstFrameRenderedRef = useRef(false);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastRenderedFrameRef = useRef<number>(-1);
  const currentFrameRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const renderFrameOnCanvas = (canvas: HTMLCanvasElement | null, index: number) => {
    if (!canvas || imagesRef.current.length === 0) return;
    if (index === lastRenderedFrameRef.current) return;
    lastRenderedFrameRef.current = index;

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    currentFrameRef.current = index;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const bufWidth = Math.ceil(cssWidth * dpr);
    const bufHeight = Math.ceil(cssHeight * dpr);

    if (canvas.width !== bufWidth || canvas.height !== bufHeight) {
      canvas.width = bufWidth;
      canvas.height = bufHeight;
      ctx.scale(dpr, dpr);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    const scale = Math.min(cssWidth / imgWidth, cssHeight / imgHeight) * 0.90;

    ctx.drawImage(img, 0, 0, imgWidth * scale, imgHeight * scale);
  };

  const renderFrame = (index: number) => {
    renderFrameOnCanvas(canvasRef.current, index);
  };

  useEffect(() => {
    let active = true;
    let observer: IntersectionObserver | null = null;
    const el = containerRef.current;

    const loadImages = () => {
      const loadedImages: HTMLImageElement[] = [];
      let loadedCount = 0;

      const checkAllLoaded = () => {
        loadedCount++;
        if (active) {
          if (loadedCount === 1) {
            imagesRef.current = loadedImages;
            renderFrameOnCanvas(canvasRef.current, 0);
          }
        }
        if (loadedCount === frameCount && active) {
          imagesRef.current = loadedImages;
          allLoadedRef.current = true;
          if (firstFrameRenderedRef.current) {
            setFadingOut(true);
          } else {
            firstFrameRenderedRef.current = true;
            setFadingOut(true);
          }
        }
      };

      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        if (i === 1) img.fetchPriority = 'high';
        img.src = framePathPattern(i);
        img.onload = checkAllLoaded;
        img.onerror = () => {
          console.error('Failed to load frame: ' + framePathPattern(i));
          checkAllLoaded();
        };
        loadedImages.push(img);
      }
    };

    if (el) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadImages();
            observer?.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
    } else {
      loadImages();
    }

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [frameCount, framePathPattern]);

  useEffect(() => {
    let active = true;
    const src = framePathPattern(1);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    const img = new Image();
    img.fetchPriority = 'high';
    img.onload = () => {
      if (active) {
        imagesRef.current[0] = img;
        renderFrameOnCanvas(canvasRef.current, 0);
        firstFrameRenderedRef.current = true;
        if (allLoadedRef.current) setFadingOut(true);
      }
    };
    img.onerror = () => {
      console.error('Failed to preload hero frame: ' + src);
      if (active) {
        firstFrameRenderedRef.current = true;
        if (allLoadedRef.current) setFadingOut(true);
      }
    };
    img.src = src;
    return () => {
      active = false;
      try { document.head.removeChild(link); } catch {}
    };
  }, [framePathPattern]);

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      console.warn('Hero preloader timed out — forcing completion');
      allLoadedRef.current = true;
      firstFrameRenderedRef.current = true;
      setFadingOut(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (loading) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
    } else {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      window.scrollTo(0, scrollY || 0);
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0', 10) * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      window.scrollTo(0, scrollY || 0);
    };
  }, [loading]);

  useEffect(() => {
    if (loading || !containerRef.current || !canvasRef.current || imagesRef.current.length === 0) return;

    const lastFrame = frameCount - 1;

    const computeProgress = () => {
      const el = containerRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const totalScroll = rect.height;
      if (totalScroll <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / totalScroll));
    };

    const onScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        const progress = computeProgress();
        const frameIndex = Math.min(lastFrame, Math.round(progress * lastFrame));
        if (frameIndex !== lastRenderedFrameRef.current) {
          renderFrame(frameIndex);
        }

        const pct = progress * 100;

        overlays.forEach((overlay, index) => {
          const el = overlayRefs.current[index];
          if (!el) return;

          const start = overlay.startPercentage;
          const end = overlay.endPercentage;
          const duration = end - start;

          if (pct > end) {
            if (overlay.persistAfterEnd) {
              el.style.display = 'block';
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            } else {
              el.style.display = 'none';
            }
            return;
          }

          if (pct < start) {
            el.style.display = 'none';
            return;
          }

          el.style.display = 'block';

          const fadeInEnd = start + duration * 0.2;
          const fadeOutStart = start + duration * 0.8;

          if (pct < fadeInEnd && start > 0) {
            const t = (pct - start) / (duration * 0.2);
            el.style.opacity = String(t);
            el.style.transform = `translateY(${(1 - t) * 10}px)`;
          } else if (pct > fadeOutStart && !overlay.persistAfterEnd) {
            const t = (pct - fadeOutStart) / (duration * 0.2);
            el.style.opacity = String(1 - t);
            el.style.transform = `translateY(${-t * 10}px)`;
          } else {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }
        });
      });
    };

    const handleResize = () => {
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading, frameCount, overlays, navbarHeight]);

  const isRtl = locale === 'ar';

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-white"
      style={{ height: `calc(${SCROLL_DISTANCE_VH}vh)` }}
    >
      <div
        className="sticky overflow-hidden bg-white"
        style={{ top: navbarHeight, height: '70dvh' }}
      >
        {(loading || fadingOut) && (
          <div
            className={`absolute inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300 ${
              fadingOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        )}

        <div className="absolute inset-0 overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 z-20 bg-white" style={{ height: '2px' }} />
          <canvas
            ref={canvasRef}
            className={`w-full h-full pointer-events-none bg-white ${isRtl ? '' : 'scale-x-[-1]'}`}
            style={{ border: 'none', outline: 'none' }}
          />
          <div
            className={`absolute ${isRtl ? 'left-0' : 'right-0'} bottom-[18%] w-[55%] h-5 pointer-events-none z-0`}
            style={{
              background: isRtl
                ? 'radial-gradient(ellipse 80% 50% at 0% 50%, rgba(0,0,0,0.14) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 80% 50% at 100% 50%, rgba(0,0,0,0.14) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        </div>

        <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-16 sm:top-20 md:top-24 lg:top-28 xl:top-32 ${isRtl ? 'mr-6 sm:mr-10 md:mr-24 lg:mr-32 xl:mr-40' : 'ml-6 sm:ml-10 md:ml-24 lg:ml-32 xl:ml-40'} max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-3xl pointer-events-none overflow-y-auto h-[calc(100%-5rem)]`}>
          <div className="w-full">
            {overlays.map((overlay, index) => (
              <div
                key={index}
                ref={(el) => { overlayRefs.current[index] = el; }}
                className={`scrolly-overlay-${index}`}
                style={{
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr',
                  display: 'none',
                  opacity: '0',
                }}
              >
                {(overlay.subtitleAr || overlay.subtitleEn) && (
                  <span className="text-teal-600 text-xs sm:text-sm md:text-base lg:text-lg font-bold uppercase tracking-widest block mb-2 sm:mb-3 font-cairo">
                    {isRtl ? overlay.subtitleAr : overlay.subtitleEn}
                  </span>
                )}
                <h2 className="text-slate-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.2] font-cairo">
                  {isRtl ? overlay.titleAr : overlay.titleEn}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mt-2 sm:mt-3 md:mt-4 leading-relaxed font-cairo">
                  {isRtl ? overlay.descAr : overlay.descEn}
                </p>
                {overlay.ctaAr && overlay.ctaEn && overlay.ctaHref && (
                  <a
                    href={overlay.ctaHref}
                    className="pointer-events-auto inline-block mt-3 sm:mt-4 md:mt-6 px-4 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-4 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm md:text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
                  >
                    {isRtl ? overlay.ctaAr : overlay.ctaEn}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
