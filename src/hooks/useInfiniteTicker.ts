'use client';

import { useRef, useEffect, useCallback } from 'react';

interface UseInfiniteTickerOptions {
  isRtl: boolean;
  speed?: number;
}

export function useInfiniteTicker({ isRtl, speed = 0.3 }: UseInfiniteTickerOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const translateX = useRef(0);
  const rafId = useRef(0);
  const paused = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTranslate = useRef(0);
  const halfRef = useRef(0);

  const wrapTranslate = useCallback(() => {
    const half = halfRef.current;
    if (half <= 0) return;
    if (isRtl) {
      if (translateX.current > 0) translateX.current -= half;
      if (translateX.current <= -half) translateX.current += half;
    } else {
      if (translateX.current < 0) translateX.current += half;
      if (translateX.current >= half) translateX.current -= half;
    }
  }, [isRtl]);

  const updateTransform = useCallback(() => {
    const track = trackRef.current;
    if (track) {
      track.style.transform = `translate3d(${translateX.current}px,0,0)`;
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const children = track.children;
    if (children.length === 0) return;

    const childCount = children.length / 2;
    let total = 0;
    for (let i = 0; i < childCount; i++) {
      total += (children[i] as HTMLElement).offsetWidth;
    }
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    halfRef.current = total + gap * (childCount - 1);

    translateX.current = 0;
    updateTransform();

    const onResize = () => {
      let total = 0;
      for (let i = 0; i < childCount; i++) {
        total += (children[i] as HTMLElement).offsetWidth;
      }
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      halfRef.current = total + gap * (childCount - 1);
      wrapTranslate();
      updateTransform();
    };

    window.addEventListener('resize', onResize);

    function tick() {
      if (!paused.current) {
        const dir = isRtl ? -1 : 1;
        translateX.current += dir * speed;
        wrapTranslate();
        updateTransform();
      }
      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', onResize);
    };
  }, [isRtl, speed, wrapTranslate, updateTransform]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    paused.current = true;
    dragStartX.current = e.clientX;
    dragStartTranslate.current = translateX.current;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!paused.current) return;
    const delta = e.clientX - dragStartX.current;
    translateX.current = dragStartTranslate.current + delta;
    wrapTranslate();
    updateTransform();
  }, [wrapTranslate, updateTransform]);

  const onPointerUp = useCallback(() => {
    paused.current = false;
  }, []);

  const onPointerCancel = useCallback(() => {
    paused.current = false;
  }, []);

  return {
    trackRef,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
