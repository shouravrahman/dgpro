'use client';

import { useEffect, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';

export function useScrollAnimation() {
    const { scrollY, scrollYProgress } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    // Parallax transforms
    const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
    const textY = useTransform(scrollY, [0, 500], [0, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        const unsubscribe = scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });

        return () => unsubscribe();
    }, [scrollY]);

    return {
        scrollY,
        scrollYProgress,
        isScrolled,
        backgroundY,
        textY,
        opacity,
    };
}

export function useIntersectionObserver(
    elementRef: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [elementRef, options]);

    return isIntersecting;
}