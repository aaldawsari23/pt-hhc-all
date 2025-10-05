/**
 * Performance optimization utilities
 * Ensures the app runs smoothly on all devices
 */

import React from 'react';

// Debounce function for search and filter operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Optimize images for faster loading
export const optimizeImage = (src: string, width?: number, height?: number): string => {
  if (!src) return '';
  
  // For production, you might want to use a CDN service like Cloudinary
  // For now, we'll just return the original src
  return src;
};

// Memory-efficient list rendering
export const getVisibleItems = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  buffer: number = 5
) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );
  
  const start = Math.max(0, visibleStart - buffer);
  const end = Math.min(items.length - 1, visibleEnd + buffer);
  
  return {
    items: items.slice(start, end + 1),
    startIndex: start,
    endIndex: end,
    totalHeight: items.length * itemHeight,
    offsetY: start * itemHeight
  };
};

// Local storage optimization
export const safeLocalStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Local storage unavailable:', error);
      return false;
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Local storage unavailable:', error);
      return null;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Local storage unavailable:', error);
      return false;
    }
  }
};

// Network status utilities
export const networkStatus = {
  isOnline: (): boolean => navigator.onLine,
  
  addOnlineListener: (callback: () => void) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },
  
  addOfflineListener: (callback: () => void) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  }
};

// Touch optimization utilities
export const touchUtils = {
  preventZoom: () => {
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
  },
  
  addSwipeListener: (
    element: HTMLElement,
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    threshold: number = 50
  ) => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Check if horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
};

// Animation optimization
export const animationUtils = {
  requestAnimationFrame: (callback: () => void): number => {
    return window.requestAnimationFrame(callback);
  },
  
  cancelAnimationFrame: (id: number): void => {
    window.cancelAnimationFrame(id);
  },
  
  smoothTransition: (
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void
  ): () => void => {
    const startTime = Date.now();
    let animationId: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + (to - from) * easeOut;
      
      onUpdate(currentValue);
      
      if (progress < 1) {
        animationId = window.requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    animationId = window.requestAnimationFrame(animate);
    
    return () => window.cancelAnimationFrame(animationId);
  }
};

// Performance monitoring
export const performanceMonitor = {
  markStart: (name: string): void => {
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  },
  
  markEnd: (name: string): number | null => {
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measures = performance.getEntriesByName(name);
      return measures.length > 0 ? measures[measures.length - 1].duration : null;
    }
    return null;
  },
  
  logMemoryUsage: (): void => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
      });
    }
  }
};

// Bundle size optimization checks
export const bundleOptimization = {
  checkLazyLoading: (): boolean => {
    return 'IntersectionObserver' in window;
  },
  
  checkWebP: (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  },
  
  checkServiceWorker: (): boolean => {
    return 'serviceWorker' in navigator;
  }
};

// Lazy loading utility for heavy components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  return React.lazy(factory);
};

// Performance measurement hook
export const measurePerformance = (label: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const duration = end - start;
    console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    
    // Alert if performance is poor
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Memory usage monitor
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// Critical resource preloader
export const preloadCriticalResources = () => {
  const criticalUrls = [
    '/logo.png',
    '/homecare_db_bundle_ar.v3.json'
  ];
  
  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.json') ? 'fetch' : 'image';
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  console.log('🚀 Initializing performance optimizations...');
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Log capabilities
  console.log('📊 Browser capabilities:', {
    lazyLoading: bundleOptimization.checkLazyLoading(),
    webP: bundleOptimization.checkWebP(),
    serviceWorker: bundleOptimization.checkServiceWorker(),
    online: networkStatus.isOnline()
  });
  
  // Monitor memory usage in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  }
};