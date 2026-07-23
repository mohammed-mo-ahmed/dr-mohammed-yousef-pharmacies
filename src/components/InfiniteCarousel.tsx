'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';

interface InfiniteCarouselProps {
  children: React.ReactNode[];
  isRtl: boolean;
  speed?: number;
}

export default function InfiniteCarousel({ children, isRtl, speed = 20 }: InfiniteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const xRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const targetSpeedRef = useRef(speed);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(0);
  const dragXRef = useRef(0);
  const twRef = useRef(0);
  const mountedRef = useRef(false);

  const clones = useMemo(() => [...children, ...children, ...children], [children]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || clones.length === 0) return;

    const measure = () => {
      let total = 0;
      const items = track.children;
      for (let i = 0; i < children.length; i++) {
        total += (items[i] as HTMLElement).offsetWidth;
      }
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      twRef.current = total + gap * (children.length - 1);
    };

    measure();

    if (!mountedRef.current) {
      xRef.current = -twRef.current;
      track.style.transform = `translate3d(${xRef.current}px,0,0)`;
      currentSpeedRef.current = speed;
      targetSpeedRef.current = speed;
      mountedRef.current = true;
    }

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    const tick = () => {
      currentSpeedRef.current += (targetSpeedRef.current - currentSpeedRef.current) * 0.04;

      if (!draggingRef.current) {
        const step = currentSpeedRef.current * 0.016;
        xRef.current += isRtl ? -step : step;
      }

      if (xRef.current <= -twRef.current * 2) {
        xRef.current += twRef.current;
      } else if (xRef.current >= 0) {
        xRef.current -= twRef.current;
      }

      track.style.transform = `translate3d(${xRef.current}px,0,0)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [clones.length, children.length, isRtl, speed]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    targetSpeedRef.current = 0;
    dragStartRef.current = e.clientX;
    dragXRef.current = xRef.current;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    xRef.current = dragXRef.current + (e.clientX - dragStartRef.current);
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${xRef.current}px,0,0)`;
  }, []);

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
    targetSpeedRef.current = speed;
  }, [speed]);

  return (
    <div
      className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
    >
      <div
        ref={trackRef}
        className="flex gap-5 will-change-transform cursor-grab active:cursor-grabbing select-none items-stretch"
        style={{ transform: 'translate3d(0,0,0)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {clones.map((child, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[clamp(160px,70vw,220px)] sm:w-[clamp(200px,45vw,250px)] md:w-[clamp(220px,30vw,270px)] lg:w-[clamp(250px,22vw,290px)] h-full"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
