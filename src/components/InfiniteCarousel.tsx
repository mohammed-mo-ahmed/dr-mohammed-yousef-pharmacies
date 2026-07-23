'use client';

import { useMemo } from 'react';
import { useInfiniteTicker } from '@/hooks/useInfiniteTicker';

interface InfiniteCarouselProps {
  children: React.ReactNode[];
  isRtl: boolean;
  speed?: number;
}

export default function InfiniteCarousel({ children, isRtl, speed = 0.3 }: InfiniteCarouselProps) {
  const clones = useMemo(() => [...children, ...children], [children]);
  const { trackRef, handlers } = useInfiniteTicker({ isRtl, speed });

  return (
    <div
      className="infinite-carousel"
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
    >
      <div ref={trackRef} className="infinite-carousel-track">
        {clones.map((child, i) => (
          <div
            key={i}
            className="infinite-carousel-item w-[clamp(160px,70vw,220px)] sm:w-[clamp(200px,45vw,250px)] md:w-[clamp(220px,30vw,270px)] lg:w-[clamp(250px,22vw,290px)]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
