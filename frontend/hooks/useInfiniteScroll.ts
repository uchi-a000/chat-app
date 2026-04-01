"use client";

import { useEffect, useRef, useCallback } from "react";

type Options = {
  onIntersect: () => void;
  enabled?: boolean;
  rootMargin?: string;
};

/**
 * IntersectionObserver でセンチネル要素の交差を検知する汎用フック。
 * 返り値の ref をセンチネル要素に渡すと、ビューポートに入ったときに onIntersect が呼ばれる。
 */
export function useInfiniteScroll({
  onIntersect,
  enabled = true,
  rootMargin = "200px",
}: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onIntersect);
  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callbackRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
  }, []);

  return { sentinelRef: setSentinelRef };
}
