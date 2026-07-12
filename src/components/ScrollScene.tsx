'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

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
  overlays: ScrollOverlay[];
  locale: string;
  navbarHeight?: number;
  children?: ReactNode;
}

const TOTAL_FRAMES = 183;
const STEP = 3;
const SELECTED_COUNT = Math.ceil(TOTAL_FRAMES / STEP);

// Controls how much vertical scroll distance the pinned hero section occupies.
// Larger numbers = slower scroll-driven animation (more scrolling needed to
// finish it); smaller numbers = faster. Tune these two values directly.
const SCROLL_DISTANCE_MOBILE_VH = 300; // was 500
const SCROLL_DISTANCE_DESKTOP_VH = 300; // was 400

function framePath(index: number): string {
  const num = index * STEP + 1;
  return `/frames/${String(num).padStart(5, '0')}.webp`;
}

export default function ScrollScene({
  overlays,
  locale,
  navbarHeight = 80,
  children,
}: ScrollSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const animationFrameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(SELECTED_COUNT).fill(null));
  const loadedCountRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const isRtl = locale === 'ar';

  const drawFrameOnCanvas = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const bufW = Math.floor(cssW * dpr);
    const bufH = Math.floor(cssH * dpr);

    if (canvas.width !== bufW || canvas.height !== bufH) {
      canvas.width = bufW;
      canvas.height = bufH;
    }

    ctx.clearRect(0, 0, bufW, bufH);

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (srcW === 0 || srcH === 0) return;

    const srcAspect = srcW / srcH;
    const dstAspect = bufW / bufH;

    let drawW: number;
    let drawH: number;
    let offsetX: number;
    let offsetY: number;

    // Always anchor the frame flush to the top edge, and flush to the left
    // edge of the buffer. Because the canvas is mirrored via CSS `scaleX(-1)`
    // for the LTR (English) locale, a left-anchored buffer renders flush
    // against the *right* edge on screen for English, and flush against the
    // *left* edge (no mirror) for Arabic — matching top-left (AR) / mirrored
    // top-right (EN) in every viewport size, with no vertical centering.
    if (srcAspect > dstAspect) {
      drawW = bufW;
      drawH = bufW / srcAspect;
    } else {
      drawH = bufH;
      drawW = bufH * srcAspect;
    }
    offsetX = 0;
    offsetY = 0;

    ctx.drawImage(img, 0, 0, srcW, srcH, offsetX, offsetY, drawW, drawH);
  }, [isRtl]);

  const drawByProgress = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const idx = Math.min(
      SELECTED_COUNT - 1,
      Math.round(progress * (SELECTED_COUNT - 1)),
    );
    if (idx === lastDrawnRef.current) return;

    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      const prev = imagesRef.current.slice(0, idx + 1).reverse().find((i) => i && i.complete && i.naturalWidth > 0);
      if (prev) drawFrameOnCanvas(canvas, prev);
      return;
    }

    lastDrawnRef.current = idx;
    drawFrameOnCanvas(canvas, img);
  }, [drawFrameOnCanvas]);

  useEffect(() => {
    let active = true;
    const images = imagesRef.current;

    const loadBatch = (indices: number[]): Promise<void[]> =>
      Promise.all(
        indices.map(
          (i) =>
            new Promise<void>((resolve) => {
              if (!active || images[i]) { resolve(); return; }
              const img = new Image();
              img.decoding = 'async';
              img.src = framePath(i);
              img.onload = () => {
                if (!active) { resolve(); return; }
                images[i] = img;
                loadedCountRef.current++;
                resolve();
              };
              img.onerror = () => { resolve(); };
            }),
        ),
      );

    const loadAll = async () => {
      const initial = Array.from({ length: 10 }, (_, k) => k);
      await loadBatch(initial);

      if (!active) return;
      setFadingOut(true);

      const batchSize = 10;
      for (let start = 10; start < SELECTED_COUNT; start += batchSize) {
        if (!active) return;
        const batch = Array.from({ length: batchSize }, (_, k) => start + k).filter((i) => i < SELECTED_COUNT);
        await loadBatch(batch);
        await new Promise((r) => setTimeout(r, 50));
      }
    };

    loadAll();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      console.warn('Hero preloader timed out — forcing completion');
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
    if (loading || !containerRef.current) return;

    isMobileRef.current = window.innerWidth < 768;

    const computeProgress = () => {
      const el = containerRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const scrollIntoSection = Math.max(0, -rect.top);
      const panelHeight = panelRef.current?.offsetHeight || window.innerHeight * 0.6;
      const pinDistance = rect.height - panelHeight - navbarHeight;
      if (pinDistance <= 0) return 0;
      return Math.min(1, Math.max(0, scrollIntoSection / pinDistance));
    };

    const onScroll = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => {
        const progress = computeProgress();
        progressRef.current = progress;

        drawByProgress(progress);

        const pct = progress * 100;

        overlays.forEach((overlay, index) => {
          const el = overlayRefs.current[index];
          if (!el) return;

          const start = overlay.startPercentage;
          const end = overlay.endPercentage;

          const prevEnd = index > 0 ? overlays[index - 1].endPercentage : start;
          const nextStart = index < overlays.length - 1
            ? overlays[index + 1].startPercentage
            : (overlay.persistAfterEnd ? 1000 : end);

          const fadeInStart = prevEnd;
          const fadeInEnd = start;
          const fadeOutStart = end;
          const fadeOutEnd = overlay.persistAfterEnd ? 1000 : nextStart;

          if (pct < fadeInStart) {
            el.style.display = 'none';
            return;
          }

          if (!overlay.persistAfterEnd && pct > fadeOutEnd) {
            el.style.display = 'none';
            return;
          }

          el.style.display = 'block';

          if (pct < fadeInEnd && fadeInStart < fadeInEnd) {
            const t = Math.max(0, Math.min(1, (pct - fadeInStart) / (fadeInEnd - fadeInStart)));
            el.style.opacity = String(t);
            if (isMobileRef.current) {
              const dir = isRtl ? 1 : -1;
              el.style.transform = `translateX(${dir * (1 - t) * 30}px)`;
            } else {
              el.style.transform = `translateY(${(1 - t) * 10}px)`;
            }
          } else if (pct > fadeOutStart && !overlay.persistAfterEnd && fadeOutStart < fadeOutEnd) {
            const t = Math.max(0, Math.min(1, (pct - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
            el.style.opacity = String(1 - t);
            if (isMobileRef.current) {
              const dir = isRtl ? -1 : 1;
              el.style.transform = `translateX(${dir * t * 30}px)`;
            } else {
              el.style.transform = `translateY(${-t * 10}px)`;
            }
          } else {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [loading, overlays, navbarHeight, drawByProgress]);

  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const update = () => {
      isMobileRef.current = window.innerWidth < 768;
      lastDrawnRef.current = -1;
      drawByProgress(progressRef.current);
    };

    update();
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [loading, drawByProgress]);

  const canvasWrapperClass = [
    'pointer-events-none overflow-hidden',
    'relative w-full m-0 p-0',
    'h-[30dvh]',
    'md:h-[45dvh]',
    'md:absolute md:top-0 md:h-full md:w-1/2',
    isRtl ? 'md:left-0' : 'md:right-0',
  ].join(' ');

  const textOverlayClass = [
    'relative w-full pointer-events-none',
    'px-5 py-3 overflow-hidden',
    'md:absolute md:top-1/2 md:-translate-y-1/2 md:w-1/2 md:px-0 md:py-0',
    'max-w-md lg:max-w-lg xl:max-w-xl',
    isRtl ? 'md:right-0 md:pr-6 lg:pr-24' : 'md:left-0 md:pl-6 lg:pl-24',
  ].join(' ');

  return (
    <>
      {(loading || fadingOut) && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 ${
            fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ minHeight: '100dvh' }}
        >
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Keep these two Tailwind height classes in sync with the
          SCROLL_DISTANCE_MOBILE_VH / SCROLL_DISTANCE_DESKTOP_VH constants
          above — Tailwind's JIT compiler needs literal class strings, so it
          can't read the JS constants directly. */}
      <section
        ref={containerRef}
        className="relative w-full bg-white h-[300vh] md:h-[300vh]"
      >
        <div
          ref={panelRef}
          className="sticky w-full bg-white m-0"
          style={{ top: navbarHeight }}
        >
          <div className="relative w-full overflow-hidden bg-white m-0 p-0 md:h-[65dvh]">
            <div
              className="block absolute top-0 left-0 right-0 bg-white pointer-events-none"
              style={{ height: '1px', zIndex: 30 }}
            />

            <div className={canvasWrapperClass}>
              <canvas
                ref={canvasRef}
                className="hero-canvas pointer-events-none"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  imageRendering: 'auto',
                  transform: isRtl ? 'none' : 'scaleX(-1)',
                }}
              />
            </div>

            <div className={textOverlayClass}>
              <div className="w-full grid">
                {overlays.map((overlay, index) => (
                  <div
                    key={index}
                    ref={(el) => { overlayRefs.current[index] = el; }}
                    className={`scrolly-overlay-${index} text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}
                    style={{
                      direction: isRtl ? 'rtl' : 'ltr',
                      display: 'none',
                      opacity: '0',
                      gridRow: '1',
                      gridColumn: '1',
                    }}
                  >
                    {(overlay.subtitleAr || overlay.subtitleEn) && (
                      <span className="text-teal-600 text-[11px] sm:text-xs md:text-sm lg:text-base font-bold uppercase tracking-widest block mb-1.5 sm:mb-2 font-cairo">
                        {isRtl ? overlay.subtitleAr : overlay.subtitleEn}
                      </span>
                    )}
                    <h2 className="text-slate-900 text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.2] font-cairo">
                      {isRtl ? overlay.titleAr : overlay.titleEn}
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm md:text-sm lg:text-base mt-1.5 sm:mt-2 md:mt-3 leading-relaxed font-cairo">
                      {isRtl ? overlay.descAr : overlay.descEn}
                    </p>
                    {overlay.ctaAr && overlay.ctaEn && overlay.ctaHref && (
                      <a
                        href={overlay.ctaHref}
                        className="pointer-events-auto inline-block mt-2 sm:mt-3 md:mt-4 px-4 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm md:text-sm lg:text-base font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
                      >
                        {isRtl ? overlay.ctaAr : overlay.ctaEn}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {children}
        </div>
      </section>
    </>
  );
}