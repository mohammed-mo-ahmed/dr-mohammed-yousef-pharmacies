'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FrameDecoder } from '@/lib/frame-decoder';

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

const SCROLL_DISTANCE_VH = 400;
const MP4_URL = '/animation.mp4';
const WEBM_URL = '/animation.webm';
const HAS_WEBCODECS = typeof VideoDecoder !== 'undefined';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const decoderRef = useRef<FrameDecoder | null>(null);

  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const animationFrameRef = useRef<number>(0);
  const progressRef = useRef(0);

  const isRtl = locale === 'ar';

  const drawFirstFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const decoder = decoderRef.current;
    if (!canvas || !decoder?.isReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    decoder.drawFrame(ctx, w, h, 0, isRtl);
  }, [isRtl]);

  useEffect(() => {
    if (!HAS_WEBCODECS) {
      const video = videoRef.current;
      if (!video) return;
      let active = true;
      const onCanPlay = () => { if (active) setFadingOut(true); };
      const onError = () => { if (active) setFadingOut(true); };
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.load();
      return () => { active = false; video.removeEventListener('canplay', onCanPlay); video.removeEventListener('error', onError); };
    }

    let active = true;
    const decoder = new FrameDecoder();
    decoderRef.current = decoder;

    decoder.init(MP4_URL).then(() => {
      if (!active) return;
      drawFirstFrame();
      setFadingOut(true);
    }).catch((e) => {
      console.error('[ScrollScene] Decode failed:', e);
      if (active) setFadingOut(true);
    });

    return () => {
      active = false;
      decoder.destroy();
      decoderRef.current = null;
    };
  }, [drawFirstFrame]);

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

        if (HAS_WEBCODECS && decoderRef.current?.isReady) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              decoderRef.current.drawFrame(ctx, canvas.width, canvas.height, progress, isRtl);
            }
          }
        } else {
          const video = videoRef.current;
          if (video && video.duration > 0) {
            const target = progress * video.duration;
            if (Math.abs(video.currentTime - target) > 0.04) {
              video.currentTime = target;
            }
          }
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

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [loading, overlays, navbarHeight]);

  useEffect(() => {
    if (loading || !HAS_WEBCODECS) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const update = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        drawFirstFrame();
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [loading, drawFirstFrame]);

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

      <section
        ref={containerRef}
        className="relative w-full bg-white"
        style={{ height: `calc(${SCROLL_DISTANCE_VH}vh)` }}
      >
        <div
          ref={panelRef}
          className="sticky w-full bg-white"
          style={{ top: navbarHeight }}
        >
          <div className="relative w-full overflow-hidden bg-white" style={{ height: '65dvh' }}>
            <div
              className="absolute top-0 left-0 right-0 bg-white pointer-events-none"
              style={{ height: '1px', zIndex: 30 }}
            />

          {HAS_WEBCODECS ? (
            <div
              className="pointer-events-none overflow-hidden"
              style={{
                position: 'absolute',
                top: 0,
                [isRtl ? 'left' : 'right']: 0,
                width: '50%',
                height: '100%',
              }}
            >
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
          ) : (
            <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} h-full overflow-hidden pointer-events-none`}>
              <video
                ref={videoRef}
                className="h-full w-auto max-w-[50vw] object-cover object-left-top pointer-events-none"
                muted
                playsInline
                preload="auto"
                style={{ border: 'none', outline: 'none', transform: isRtl ? 'none' : 'scaleX(-1)' }}
              >
                <source src={WEBM_URL} type="video/webm" />
                <source src={MP4_URL} type="video/mp4" />
              </video>
            </div>
          )}

          <div className={`absolute ${isRtl ? 'right-0 pr-6 sm:pr-10 md:pr-16 lg:pr-24' : 'left-0 pl-6 sm:pl-10 md:pl-16 lg:pl-24'} top-1/2 -translate-y-1/2 w-[50%] max-w-md lg:max-w-lg xl:max-w-xl pointer-events-none`}>
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
                    <span className="text-teal-600 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold uppercase tracking-widest block mb-1.5 sm:mb-2 font-cairo">
                      {isRtl ? overlay.subtitleAr : overlay.subtitleEn}
                    </span>
                  )}
                  <h2 className="text-slate-900 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-[1.2] font-cairo">
                    {isRtl ? overlay.titleAr : overlay.titleEn}
                  </h2>
                  <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm lg:text-base mt-1.5 sm:mt-2 md:mt-3 leading-relaxed font-cairo">
                    {isRtl ? overlay.descAr : overlay.descEn}
                  </p>
                  {overlay.ctaAr && overlay.ctaEn && overlay.ctaHref && (
                    <a
                      href={overlay.ctaHref}
                      className="pointer-events-auto inline-block mt-2 sm:mt-3 md:mt-4 px-3 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3 bg-teal-600 hover:bg-teal-700 text-white text-[10px] sm:text-xs md:text-sm lg:text-base font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
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
