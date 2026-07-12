"use client";

import { useCallback, useRef, useState } from "react";

interface UseInViewOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
}

export function useInView(options?: UseInViewOptions) {
    const [inView, setInView] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            // Putuskan observer lama jika ada
            if (observerRef.current) {
                observerRef.current.disconnect();
            }

            if (!node) return;

            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    setInView(entry.isIntersecting);
                },
                {
                    root: options?.root ?? null,
                    rootMargin: options?.rootMargin ?? "100px", // Memicu 200px sebelum mentok bawah
                    threshold: options?.threshold ?? 0,
                },
            );

            observerRef.current.observe(node);
        },
        [options?.root, options?.rootMargin, options?.threshold],
    );

    return { sentinelRef, inView };
}
