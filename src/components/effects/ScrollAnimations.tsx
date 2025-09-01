'use client';

import { useEffect } from 'react';
import {
  initializeScrollTracking,
  initializeTimeTracking,
} from '@/lib/analytics/conversion-tracking';

export function ScrollAnimations() {
  useEffect(() => {
    // Initialize scroll depth tracking
    const cleanupScroll = initializeScrollTracking();

    // Initialize time on page tracking
    const cleanupTime = initializeTimeTracking();

    // Cleanup functions
    return () => {
      if (cleanupScroll) cleanupScroll();
      if (cleanupTime) cleanupTime();
    };
  }, []);

  return null; // This component doesn't render anything
}
