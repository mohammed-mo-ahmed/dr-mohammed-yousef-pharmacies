'use client';

import { useEffect, useRef, useState } from 'react';

export interface ScrollOverlay {
  startPercentage: number;
  endPercentage: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  ctaAr?: string;
  ctaEn?: string;
  ctaHref?: string;
}

interface ScrollSceneProps {
  frameCount: number;
  framePathPattern: (index: number) => string;
  overlays: ScrollOverlay[];
  locale: string;
  navbarHeight?: number;
}

const SCROLL_DISTANCE_VH = 200;

export default function ScrollScene({
  frameCount,
  framePathPattern,
  overlays,
  locale,
  navbarHeight = 80,
}: ScrollSceneProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const staticHeroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastRenderedFrameRef = useRef<number>(-1);
  const currentFrameRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const wasCompletedRef = useRef<boolean>(false);

  const renderFrameOnCanvas = (canvas: HTMLCanvasElement | null, index: number) => {
    if (!canvas || imagesRef.current.length === 0) return;

    if (index === lastRenderedFrameRef.current && canvas === canvasRef.current) return;
    if (canvas === canvasRef.current) {
      lastRenderedFrameRef.current = index;
    }

    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas === canvasRef.current) {
      currentFrameRef.current = index;
    }

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

    const scale = Math.min(cssWidth / imgWidth, cssHeight / imgHeight) * 0.75;

    ctx.drawImage(img, 0, 0, imgWidth * scale, imgHeight * scale);
  };

  const renderFrame = (index: number) => {
    renderFrameOnCanvas(canvasRef.current, index);
  };

  useEffect(() => {
    let active = true;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (active) {
        setLoadProgress(Math.round((loadedCount / frameCount) * 100));
      }
      if (loadedCount === frameCount && active) {
        imagesRef.current = loadedImages;
        setLoading(false);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = framePathPattern(i);
      img.onload = checkAllLoaded;
      img.onerror = () => {
        console.error('Failed to load frame: ' + framePathPattern(i));
        checkAllLoaded();
      };
      loadedImages.push(img);
    }

    return () => {
      active = false;
    };
  }, [frameCount, framePathPattern]);

  useEffect(() => {
    if (loading || !spacerRef.current || !canvasRef.current || imagesRef.current.length === 0) return;

    const lastFrame = frameCount - 1;

    const computeProgress = () => {
      if (!spacerRef.current) return 0;
      const rect = spacerRef.current.getBoundingClientRect();
      const total = rect.height;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    };

    const onScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const progress = computeProgress();
        const pct = progress * 100;

        const frameIndex = Math.round(progress * lastFrame);
        if (frameIndex !== lastRenderedFrameRef.current) {
          renderFrame(frameIndex);
        }

        // Crossfade between fixed (animated) and static hero at completion
        const isCompleted = progress >= 1;
        if (isCompleted !== wasCompletedRef.current) {
          wasCompletedRef.current = isCompleted;
          const fixed = heroRef.current;
          const stat = staticHeroRef.current;

          if (isCompleted) {
            renderFrameOnCanvas(staticCanvasRef.current, lastFrame);
            if (fixed) {
              fixed.style.transition = 'opacity 0.4s ease';
              fixed.style.opacity = '0';
              fixed.style.pointerEvents = 'none';
            }
            if (stat) {
              stat.style.transition = 'opacity 0.4s ease';
              stat.style.opacity = '1';
              stat.style.pointerEvents = 'auto';
            }
          } else {
            if (fixed) {
              fixed.style.transition = 'opacity 0.4s ease';
              fixed.style.opacity = '1';
              fixed.style.pointerEvents = 'auto';
            }
            if (stat) {
              stat.style.transition = 'opacity 0.4s ease';
              stat.style.opacity = '0';
              stat.style.pointerEvents = 'none';
            }
          }
        }

        if (isCompleted) return;

        overlays.forEach((overlay, index) => {
          const el = overlayRefs.current[index];
          if (!el) return;

          const start = overlay.startPercentage;
          const end = overlay.endPercentage;
          const duration = end - start;

          if (pct < start || pct > end) {
            el.style.display = 'none';
            return;
          }

          el.style.display = 'block';

          const fadeInEnd = start + duration * 0.2;
          const fadeOutStart = start + duration * 0.8;

          if (index === 0) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          } else if (pct < fadeInEnd) {
            const t = (pct - start) / (duration * 0.2);
            el.style.opacity = String(t);
            el.style.transform = `translateY(${(1 - t) * 10}px)`;
          } else if (pct > fadeOutStart) {
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
      if (wasCompletedRef.current) {
        renderFrameOnCanvas(staticCanvasRef.current, frameCount - 1);
      }
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
  }, [loading, frameCount, overlays]);

  const isRtl = locale === 'ar';

  const lastOverlay = overlays[overlays.length - 1];

  return (
    <>
      {/* Spacer creates scroll distance for the animation */}
      <div ref={spacerRef} className="w-full" style={{ height: SCROLL_DISTANCE_VH + 'vh' }} />

      {/* Static hero — in normal document flow; hidden during animation, visible after */}
      <div
        ref={staticHeroRef}
        className="w-full relative overflow-hidden bg-white"
        style={{
          minHeight: 'calc(60vh - ' + navbarHeight + 'px)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div className="absolute top-0 left-0 right-0 z-20 bg-white" style={{ height: '2px' }} />

        <canvas
          ref={staticCanvasRef}
          className="w-full h-full pointer-events-none bg-white"
          style={{ border: 'none', outline: 'none' }}
        />

        <div
          className="absolute left-0 bottom-[18%] w-[55%] h-5 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 0% 50%, rgba(0,0,0,0.14) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div className="absolute right-4 sm:right-8 md:right-16 lg:right-28 top-48 sm:top-16 md:top-20 lg:top-28 xl:top-36 z-10 w-full max-w-[75vw] sm:max-w-sm md:max-w-xl lg:max-w-3xl pointer-events-none">
          {lastOverlay && (
            <div style={{ textAlign: 'right', direction: isRtl ? 'rtl' : 'ltr' }}>
              <span className="text-teal-600 text-xs sm:text-sm md:text-base lg:text-lg font-bold uppercase tracking-widest block mb-2 sm:mb-3 font-cairo">
                {isRtl ? 'اكتشف' : 'Discover'}
              </span>
              <h2 className="text-slate-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] font-cairo">
                {isRtl ? lastOverlay.titleAr : lastOverlay.titleEn}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4 md:mt-5 leading-relaxed font-cairo">
                {isRtl ? lastOverlay.descAr : lastOverlay.descEn}
              </p>
              {lastOverlay.ctaAr && lastOverlay.ctaEn && lastOverlay.ctaHref && (
                <a
                  href={lastOverlay.ctaHref}
                  className="pointer-events-auto inline-block mt-4 sm:mt-5 md:mt-7 px-5 sm:px-6 md:px-8 py-3 sm:py-4 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
                >
                  {isRtl ? lastOverlay.ctaAr : lastOverlay.ctaEn}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed hero overlay — covers viewport during scroll animation */}
      <div
        ref={heroRef}
        className="fixed inset-0 z-10 overflow-hidden bg-white"
        style={{
          top: navbarHeight + 'px',
          height: 'calc(100dvh - ' + navbarHeight + 'px)',
        }}
      >
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium font-sans">
              {isRtl ? 'جاري تحميل التجربة التفاعلية...' : 'Loading interactive experience...'}
            </p>
            <div className="mt-2 text-sm text-teal-600 font-semibold">{loadProgress}%</div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 z-20 bg-white" style={{ height: '2px' }} />

        <canvas
          ref={canvasRef}
          className="w-full h-full pointer-events-none bg-white"
          style={{
            display: loading ? 'none' : 'block',
            border: 'none',
            outline: 'none',
          }}
        />

        <div
          className="absolute left-0 bottom-[18%] w-[55%] h-5 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 0% 50%, rgba(0,0,0,0.14) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div className="absolute right-4 sm:right-8 md:right-16 lg:right-28 top-48 sm:top-16 md:top-20 lg:top-28 xl:top-36 z-10 w-full max-w-[75vw] sm:max-w-sm md:max-w-xl lg:max-w-3xl pointer-events-none">
          {overlays.map((overlay, index) => (
            <div
              key={index}
              ref={(el) => { overlayRefs.current[index] = el; }}
              className={'scrolly-overlay-' + index}
              style={{
                textAlign: 'right',
                direction: isRtl ? 'rtl' : 'ltr',
                display: index === 0 ? 'block' : 'none',
                opacity: index === 0 ? '1' : '0',
                transform: index === 0 ? 'translateY(0)' : '',
              }}
            >
              <span className="text-teal-600 text-xs sm:text-sm md:text-base lg:text-lg font-bold uppercase tracking-widest block mb-2 sm:mb-3 font-cairo">
                {isRtl ? 'اكتشف' : 'Discover'}
              </span>
              <h2 className="text-slate-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] font-cairo">
                {isRtl ? overlay.titleAr : overlay.titleEn}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4 md:mt-5 leading-relaxed font-cairo">
                {isRtl ? overlay.descAr : overlay.descEn}
              </p>
              {overlay.ctaAr && overlay.ctaEn && overlay.ctaHref && (
                <a
                  href={overlay.ctaHref}
                  className="pointer-events-auto inline-block mt-4 sm:mt-5 md:mt-7 px-5 sm:px-6 md:px-8 py-3 sm:py-4 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
                >
                  {isRtl ? overlay.ctaAr : overlay.ctaEn}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
