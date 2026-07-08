'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

export default function ScrollScene({
  frameCount,
  framePathPattern,
  overlays,
  locale,
  navbarHeight = 80,
}: ScrollSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const lastRenderedFrameRef = useRef<number>(-1);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
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

    const scale = Math.min(cssWidth / imgWidth, cssHeight / imgHeight) * 0.75;

    ctx.drawImage(img, 0, 0, imgWidth * scale, imgHeight * scale);
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
    if (loading || !containerRef.current || !canvasRef.current || imagesRef.current.length === 0) return;

    renderFrame(0);
    lastRenderedFrameRef.current = 0;

    const handleResize = () => {
      lastRenderedFrameRef.current = -1;
      renderFrame(currentFrameRef.current);
    };
    window.addEventListener('resize', handleResize);

    const playhead = { frame: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(playhead, {
      frame: frameCount - 1,
      ease: 'none',
      duration: 100,
      onUpdate: () => {
        const frameIndex = Math.floor(playhead.frame);
        if (frameIndex !== lastRenderedFrameRef.current) {
          requestAnimationFrame(() => renderFrame(frameIndex));
        }
      },
    }, 0);

    overlays.forEach((overlay, index) => {
      const start = overlay.startPercentage;
      const end = overlay.endPercentage;
      const duration = end - start;
      const selector = '.scrolly-overlay-' + index;

      if (index === 0) {
        gsap.set(selector, { opacity: 1, y: 0, display: 'block' });
      } else {
        gsap.set(selector, { opacity: 0, y: 10, display: 'none' });
      }

      tl.to(selector, {
        display: 'block',
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: duration * 0.2,
      }, start);

      tl.to(selector, {
        opacity: 1,
        y: 0,
        duration: duration * 0.6,
      }, start + duration * 0.2);

      tl.to(selector, {
        opacity: 0,
        y: -10,
        ease: 'power2.in',
        duration: duration * 0.2,
        onComplete: () => {
          gsap.set(selector, { display: 'none' });
        }
      }, start + duration * 0.8);
    });

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loading, frameCount, overlays, navbarHeight]);

  const isRtl = locale === 'ar';

  return (
    <div
      ref={containerRef}
      className="scrollytelling-section relative h-[400vh] w-full bg-white"
    >
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium font-sans">
            {isRtl ? 'جاري تحميل التجربة التفاعلية...' : 'Loading interactive experience...'}
          </p>
          <div className="mt-2 text-sm text-teal-600 font-semibold">{loadProgress}%</div>
        </div>
      )}

      <div
        ref={stickyRef}
        className="sticky w-full overflow-hidden bg-white"
        style={{
          top: navbarHeight + 'px',
          height: 'calc(100vh - ' + navbarHeight + 'px)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white z-20"></div>
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

        <div className="absolute right-8 md:right-16 lg:right-28 top-20 md:top-28 lg:top-36 z-10 w-full max-w-sm md:max-w-xl lg:max-w-3xl pointer-events-none">
          {overlays.map((overlay, index) => (
            <div
              key={index}
              className={'scrolly-overlay-' + index}
              style={{
                textAlign: 'right',
                direction: isRtl ? 'rtl' : 'ltr',
              }}
            >
              <span className="text-teal-600 text-base md:text-lg font-bold uppercase tracking-widest block mb-3 font-cairo">
                {isRtl ? 'اكتشف' : 'Discover'}
              </span>
              <h2 className="text-slate-900 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] font-cairo">
                {isRtl ? overlay.titleAr : overlay.titleEn}
              </h2>
              <p className="text-slate-500 text-lg md:text-xl mt-5 leading-relaxed font-cairo">
                {isRtl ? overlay.descAr : overlay.descEn}
              </p>
              {overlay.ctaAr && overlay.ctaEn && overlay.ctaHref && (
                <a
                  href={overlay.ctaHref}
                  className="pointer-events-auto inline-block mt-7 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
                >
                  {isRtl ? overlay.ctaAr : overlay.ctaEn}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
